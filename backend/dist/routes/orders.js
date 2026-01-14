"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../utils/validationSchemas");
const sanitize_1 = require("../utils/sanitize");
const emailService_1 = __importDefault(require("../utils/emailService"));
const orderEmailHelper_1 = require("../utils/orderEmailHelper");
const trackingNumberGenerator_1 = require("../utils/trackingNumberGenerator");
const inventoryManager_1 = require("../utils/inventoryManager");
const logger_1 = __importDefault(require("../utils/logger"));
const shippingCalculator_1 = require("../utils/shippingCalculator");
router.get('/', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const orders = await Order_1.default.find({}).populate('user', 'name email');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', auth_1.protect, (0, validation_1.validate)(validationSchemas_1.orderSchemas.create), async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = (0, sanitize_1.sanitizeObject)(req.body);
        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        const stockValidation = await (0, inventoryManager_1.validateStockAvailability)(items.map((item) => ({
            product: item.product,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
        })));
        if (!stockValidation.valid) {
            const errorMessages = stockValidation.errors.map((err) => `${err.productTitle} (${err.size}/${err.color}): Requested ${err.requested}, Available ${err.available}`);
            return res.status(400).json({
                message: 'Insufficient stock for some items',
                errors: stockValidation.errors,
                details: errorMessages,
            });
        }
        let calculatedShippingPrice = shippingPrice || 0;
        if (shippingAddress && shippingAddress.country) {
            try {
                const shippingCalculation = await (0, shippingCalculator_1.calculateShipping)({
                    items: items.map((item) => ({
                        product: item.product,
                        quantity: item.quantity,
                    })),
                    shippingAddress: {
                        country: shippingAddress.country,
                        city: shippingAddress.city,
                        postalCode: shippingAddress.postalCode,
                        state: shippingAddress.state,
                    },
                    orderValue: itemsPrice,
                });
                calculatedShippingPrice = shippingCalculation.shippingPrice;
                logger_1.default.info('Shipping calculated for order', {
                    calculated: calculatedShippingPrice,
                    provided: shippingPrice,
                });
            }
            catch (shippingError) {
                logger_1.default.error('Failed to calculate shipping', {
                    error: shippingError.message,
                    usingProvided: shippingPrice,
                });
            }
        }
        const finalTotalPrice = itemsPrice + taxPrice + calculatedShippingPrice;
        let trackingNumber = (0, trackingNumberGenerator_1.generateTrackingNumber)();
        let existingOrder = await Order_1.default.findOne({ trackingNumber });
        let attempts = 0;
        while (existingOrder && attempts < 5) {
            trackingNumber = (0, trackingNumberGenerator_1.generateTrackingNumber)();
            existingOrder = await Order_1.default.findOne({ trackingNumber });
            attempts++;
        }
        const order = new Order_1.default({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice: calculatedShippingPrice,
            totalPrice: finalTotalPrice,
            trackingNumber,
            trackingHistory: [{
                    status: 'Pending',
                    timestamp: new Date(),
                    description: 'Order placed successfully'
                }]
        });
        const createdOrder = await order.save();
        try {
            await (0, inventoryManager_1.deductStock)(items.map((item) => ({
                product: item.product,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
            })), createdOrder._id.toString(), 'Order placed');
        }
        catch (stockError) {
            await Order_1.default.findByIdAndDelete(createdOrder._id);
            logger_1.default.error('Stock deduction failed after order creation', {
                orderId: createdOrder._id.toString(),
                error: stockError.message,
            });
            return res.status(400).json({
                message: stockError.message || 'Failed to process order due to stock issue',
            });
        }
        if (paymentMethod === 'Cash on Delivery' || createdOrder.isPaid) {
            try {
                const emailData = await (0, orderEmailHelper_1.formatOrderForEmail)(createdOrder);
                if (emailData && emailData.customerEmail) {
                    await emailService_1.default.sendOrderConfirmation(emailData);
                }
            }
            catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
            }
        }
        res.status(201).json(createdOrder);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id/pay', auth_1.protect, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(validationSchemas_1.orderSchemas.markAsPaid), async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this order' });
        }
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.updateTime,
            emailAddress: req.body.emailAddress
        };
        const updatedOrder = await order.save();
        if (updatedOrder.isPaid && !order.isPaid) {
            try {
                const emailData = await (0, orderEmailHelper_1.formatOrderForEmail)(updatedOrder);
                if (emailData && emailData.customerEmail) {
                    await emailService_1.default.sendOrderConfirmation(emailData);
                }
            }
            catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
            }
        }
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/deliver', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.isDelivered = true;
        order.deliveredAt = new Date();
        if (!order.status || order.status === 'Pending' || order.status === 'Processing') {
            order.status = 'Delivered';
        }
        const updatedOrder = await order.save();
        try {
            const emailData = await (0, orderEmailHelper_1.formatOrderForEmail)(updatedOrder);
            if (emailData && emailData.customerEmail) {
                await emailService_1.default.sendOrderDelivered(emailData);
            }
        }
        catch (emailError) {
            console.error('Failed to send order delivered email:', emailError);
        }
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/status', auth_1.protect, auth_1.admin, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(validationSchemas_1.orderSchemas.updateStatus), async (req, res) => {
    try {
        const { status } = (0, sanitize_1.sanitizeObject)(req.body);
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const previousStatus = order.status;
        order.status = status;
        if (status === 'Delivered' || status === 'Completed') {
            order.isDelivered = true;
            if (!order.deliveredAt) {
                order.deliveredAt = new Date();
            }
        }
        if (status === 'Completed' && !order.isPaid) {
            order.isPaid = true;
            if (!order.paidAt) {
                order.paidAt = new Date();
            }
        }
        if ((status === 'Cancelled' || status === 'Refunded') &&
            previousStatus &&
            previousStatus !== 'Cancelled' &&
            previousStatus !== 'Refunded') {
            try {
                await (0, inventoryManager_1.restoreStock)(order.items.map((item) => ({
                    product: item.product.toString(),
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                })), order._id.toString(), `Order ${status.toLowerCase()}`);
                logger_1.default.info(`Stock restored for ${status} order`, { orderId: order._id.toString() });
            }
            catch (stockError) {
                logger_1.default.error('Failed to restore stock for cancelled order', {
                    orderId: order._id.toString(),
                    error: stockError.message,
                });
            }
        }
        const updatedOrder = await order.save();
        try {
            const emailData = await (0, orderEmailHelper_1.formatOrderForEmail)(updatedOrder);
            if (emailData && emailData.customerEmail) {
                if (status === 'Shipped') {
                    if (req.body.trackingNumber) {
                        emailData.trackingNumber = req.body.trackingNumber;
                    }
                    if (req.body.estimatedDelivery) {
                        emailData.estimatedDelivery = new Date(req.body.estimatedDelivery);
                    }
                    await emailService_1.default.sendOrderShipped(emailData);
                }
                else if (status === 'Delivered' || status === 'Completed') {
                    await emailService_1.default.sendOrderDelivered(emailData);
                }
                else {
                    await emailService_1.default.sendOrderStatusUpdate(emailData);
                }
            }
        }
        catch (emailError) {
            console.error('Failed to send order status email:', emailError);
        }
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.delete('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const order = await Order_1.default.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map