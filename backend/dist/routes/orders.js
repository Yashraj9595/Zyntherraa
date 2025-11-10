"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middleware/auth");
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
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        const order = new Order_1.default({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id/pay', auth_1.protect, async (req, res) => {
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
        const updatedOrder = await order.save();
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