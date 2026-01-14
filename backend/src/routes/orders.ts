import express, { Router } from 'express';
const router: Router = express.Router();
import Order, { IOrder } from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { protect, admin } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validation';
import { orderSchemas, paramSchemas } from '../utils/validationSchemas';
import { sanitizeObject } from '../utils/sanitize';
import emailService from '../utils/emailService';
import { formatOrderForEmail } from '../utils/orderEmailHelper';
import { generateTrackingNumber } from '../utils/trackingNumberGenerator';
import { validateStockAvailability, deductStock, restoreStock } from '../utils/inventoryManager';
import logger from '../utils/logger';
import { calculateShipping } from '../utils/shippingCalculator';

// GET /api/orders - Get all orders
router.get('/', protect, admin, async (req: any, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or owner of the order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', protect, validate(orderSchemas.create), async (req: any, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = sanitizeObject(req.body);
    
    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Validate stock availability before creating order
    const stockValidation = await validateStockAvailability(
      items.map((item: any) => ({
        product: item.product,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }))
    );

    if (!stockValidation.valid) {
      const errorMessages = stockValidation.errors.map(
        (err) => `${err.productTitle} (${err.size}/${err.color}): Requested ${err.requested}, Available ${err.available}`
      );
      return res.status(400).json({
        message: 'Insufficient stock for some items',
        errors: stockValidation.errors,
        details: errorMessages,
      });
    }
    
    // Calculate shipping cost if shipping address is provided
    let calculatedShippingPrice = shippingPrice || 0;
    if (shippingAddress && shippingAddress.country) {
      try {
        const shippingCalculation = await calculateShipping({
          items: items.map((item: any) => ({
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
        logger.info('Shipping calculated for order', {
          calculated: calculatedShippingPrice,
          provided: shippingPrice,
        });
      } catch (shippingError: any) {
        logger.error('Failed to calculate shipping', {
          error: shippingError.message,
          usingProvided: shippingPrice,
        });
        // Continue with provided shipping price if calculation fails
      }
    }
    
    // Recalculate total price with calculated shipping
    const finalTotalPrice = itemsPrice + taxPrice + calculatedShippingPrice;
    
    // Generate unique tracking number
    let trackingNumber = generateTrackingNumber();
    
    // Ensure uniqueness (retry if collision)
    let existingOrder = await Order.findOne({ trackingNumber });
    let attempts = 0;
    while (existingOrder && attempts < 5) {
      trackingNumber = generateTrackingNumber();
      existingOrder = await Order.findOne({ trackingNumber });
      attempts++;
    }
    
    const order = new Order({
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
    
    // Deduct stock after order is created
    try {
      await deductStock(
        items.map((item: any) => ({
          product: item.product,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        createdOrder._id.toString(),
        'Order placed'
      );
    } catch (stockError: any) {
      // If stock deduction fails, delete the order and return error
      await Order.findByIdAndDelete(createdOrder._id);
      logger.error('Stock deduction failed after order creation', {
        orderId: createdOrder._id.toString(),
        error: stockError.message,
      });
      return res.status(400).json({
        message: stockError.message || 'Failed to process order due to stock issue',
      });
    }
    
    // Send order confirmation email (only if payment is Cash on Delivery or order is paid)
    // For Razorpay, email will be sent after payment verification
    if (paymentMethod === 'Cash on Delivery' || createdOrder.isPaid) {
      try {
        const emailData = await formatOrderForEmail(createdOrder);
        if (emailData && emailData.customerEmail) {
          await emailService.sendOrderConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    }
    
    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/orders/:id/pay - Update order to paid
router.put('/:id/pay', protect, validateParams(paramSchemas.id), validate(orderSchemas.markAsPaid), async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or owner of the order
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
    
    // Send order confirmation email if payment was just completed
    if (updatedOrder.isPaid && !order.isPaid) {
      try {
        const emailData = await formatOrderForEmail(updatedOrder);
        if (emailData && emailData.customerEmail) {
          await emailService.sendOrderConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
    }
    
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/deliver - Update order to delivered
router.put('/:id/deliver', protect, admin, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isDelivered = true;
    order.deliveredAt = new Date() as any;
    if (!order.status || order.status === 'Pending' || order.status === 'Processing') {
      order.status = 'Delivered';
    }
    
    const updatedOrder = await order.save();
    
    // Send order delivered email
    try {
      const emailData = await formatOrderForEmail(updatedOrder);
      if (emailData && emailData.customerEmail) {
        await emailService.sendOrderDelivered(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send order delivered email:', emailError);
    }
    
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', protect, admin, validateParams(paramSchemas.id), validate(orderSchemas.updateStatus), async (req: any, res) => {
  try {
    const { status } = sanitizeObject(req.body);
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const previousStatus = order.status;
    order.status = status;
    
    // Auto-update isPaid and isDelivered based on status
    if (status === 'Delivered' || status === 'Completed') {
      order.isDelivered = true;
      if (!order.deliveredAt) {
        order.deliveredAt = new Date() as any;
      }
    }
    
    if (status === 'Completed' && !order.isPaid) {
      order.isPaid = true;
      if (!order.paidAt) {
        order.paidAt = new Date() as any;
      }
    }
    
    // Restore stock if order is cancelled or refunded
    if ((status === 'Cancelled' || status === 'Refunded') && 
        previousStatus && 
        previousStatus !== 'Cancelled' && 
        previousStatus !== 'Refunded') {
      try {
        await restoreStock(
          order.items.map((item: any) => ({
            product: item.product.toString(),
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          order._id.toString(),
          `Order ${status.toLowerCase()}`
        );
        logger.info(`Stock restored for ${status} order`, { orderId: order._id.toString() });
      } catch (stockError: any) {
        logger.error('Failed to restore stock for cancelled order', {
          orderId: order._id.toString(),
          error: stockError.message,
        });
        // Don't fail the status update if stock restoration fails
      }
    }
    
    const updatedOrder = await order.save();
    
    // Send appropriate email based on status
    try {
      const emailData = await formatOrderForEmail(updatedOrder);
      if (emailData && emailData.customerEmail) {
        if (status === 'Shipped') {
          // Add tracking number if provided in request
          if (req.body.trackingNumber) {
            emailData.trackingNumber = req.body.trackingNumber;
          }
          if (req.body.estimatedDelivery) {
            emailData.estimatedDelivery = new Date(req.body.estimatedDelivery);
          }
          await emailService.sendOrderShipped(emailData);
        } else if (status === 'Delivered' || status === 'Completed') {
          await emailService.sendOrderDelivered(emailData);
        } else {
          // Send generic status update for other statuses
          await emailService.sendOrderStatusUpdate(emailData);
        }
      }
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError);
    }
    
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', protect, admin, async (req: any, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;