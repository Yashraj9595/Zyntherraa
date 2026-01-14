import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import { protect, admin } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validation';
import { paymentSchemas, paramSchemas } from '../utils/validationSchemas';
import { sanitizeObject } from '../utils/sanitize';
import emailService from '../utils/emailService';
import { formatOrderForEmail } from '../utils/orderEmailHelper';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Initialize Razorpay (only if credentials are provided)
let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info('✅ Razorpay initialized successfully');
  } catch (error) {
    logger.warn('⚠️  Razorpay initialization failed', { error });
  }
} else {
  logger.warn('⚠️  Razorpay credentials not configured. Payment gateway features will be disabled.');
}

// Payment method validation
const VALID_PAYMENT_METHODS = ['Cash on Delivery', 'Razorpay'];
const VALID_CURRENCIES = ['INR', 'USD', 'EUR'];
const MIN_AMOUNT = 1; // Minimum amount in rupees
const MAX_AMOUNT = 1000000; // Maximum amount in rupees

// Validate payment method
const validatePaymentMethod = (method: string): boolean => {
  return VALID_PAYMENT_METHODS.includes(method);
};

// Validate amount
const validateAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!amount || isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < MIN_AMOUNT) {
    return { valid: false, error: `Minimum amount is ₹${MIN_AMOUNT}` };
  }
  if (amount > MAX_AMOUNT) {
    return { valid: false, error: `Maximum amount is ₹${MAX_AMOUNT}` };
  }
  return { valid: true };
};

// Verify Razorpay webhook signature (secure constant-time comparison)
const verifyWebhookSignature = (webhookSignature: string, webhookBody: string, secret: string): boolean => {
  try {
    if (!secret) {
      console.error('Webhook secret not configured');
      return false;
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(webhookBody)
      .digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(webhookSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  };
};

// Security: Sanitize payment data (never log sensitive information)
const sanitizePaymentData = (data: any) => {
  const sanitized = { ...data };
  if (sanitized.razorpay_signature) {
    sanitized.razorpay_signature = '***REDACTED***';
  }
  if (sanitized.key_secret) {
    sanitized.key_secret = '***REDACTED***';
  }
  return sanitized;
};

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', protect, validate(paymentSchemas.createOrder), async (req: any, res) => {
  try {
    const { amount, currency = 'INR', orderId, paymentMethod } = sanitizeObject(req.body);
    
    // Security: Log sanitized data only
    console.log('Payment order creation request:', sanitizePaymentData({ amount, currency, orderId, paymentMethod }));

    // Payment method validation
    if (paymentMethod && !validatePaymentMethod(paymentMethod)) {
      return res.status(400).json({ 
        message: `Invalid payment method. Valid methods: ${VALID_PAYMENT_METHODS.join(', ')}` 
      });
    }

    // Amount validation
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ message: amountValidation.error });
    }

    // Currency validation
    if (currency && !VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({ 
        message: `Invalid currency. Valid currencies: ${VALID_CURRENCIES.join(', ')}` 
      });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment gateway is not configured. Please contact support.' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `order_${orderId}_${Date.now()}`,
      notes: {
        orderId: orderId.toString(),
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    logRequest(req, 'Razorpay order created', 'info', { 
      razorpayOrderId: razorpayOrder.id,
      orderId 
    });

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: orderId,
    });
  } catch (error: any) {
    logRequest(req, 'Razorpay order creation failed', 'error', { error: error.message });
    res.status(500).json({ 
      message: error.message || 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/payments/verify - Verify Razorpay payment
router.post('/verify', protect, validate(paymentSchemas.verify), async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = sanitizeObject(req.body);
    
    // Security: Log sanitized data only (never log signatures or secrets)
    console.log('Payment verification request:', sanitizePaymentData({ 
      razorpay_order_id, 
      razorpay_payment_id, 
      orderId 
    }));

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Security: Verify signature (constant-time comparison to prevent timing attacks)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({ message: 'Payment verification service unavailable' });
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      console.error('Invalid payment signature detected');
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order payment status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = 'Razorpay';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'success',
      updateTime: new Date().toISOString(),
      emailAddress: req.user.email || '',
    };

    const updatedOrder = await order.save();

    // Send order confirmation email after successful payment
    try {
      const emailData = await formatOrderForEmail(updatedOrder);
      if (emailData && emailData.customerEmail) {
        await emailService.sendOrderConfirmation(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail payment verification if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: error.message || 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/payments/webhook - Razorpay webhook handler (no auth required, signature verified)
// Note: This route uses raw body parser which is configured in server.ts
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookBody = req.body.toString();

    if (!webhookSignature) {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    if (!verifyWebhookSignature(webhookSignature, webhookBody, secret)) {
      logger.error('Invalid webhook signature', { 
        requestId: req.requestId,
        ip: req.ip 
      });
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(webhookBody);
    const { event: eventType, payload } = event;

    logger.info(`Received webhook event: ${eventType}`, { 
      requestId: req.requestId,
      eventType 
    });

    // Handle different webhook events
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;
      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity);
        break;
      default:
        logger.warn(`Unhandled webhook event: ${eventType}`, { 
          requestId: req.requestId,
          eventType 
        });
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook processing error', { 
      requestId: req.requestId,
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Webhook processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle payment captured event
async function handlePaymentCaptured(payment: any) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      console.error('Order ID not found in payment notes');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Security: Verify payment signature with constant-time comparison
    const text = `${payment.order_id}|${payment.id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return;
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    // Constant-time comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(payment.signature || '')
    );

    if (!isValid) {
      console.error('Invalid payment signature in webhook');
      return;
    }

    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentMethod = 'Razorpay';
      order.paymentResult = {
        id: payment.id,
        status: payment.status,
        updateTime: new Date().toISOString(),
        emailAddress: payment.email || '',
      };
      await order.save();
      console.log(`Order ${orderId} marked as paid via webhook`);
      
      // Send order confirmation email
      try {
        const emailData = await formatOrderForEmail(order);
        if (emailData && emailData.customerEmail) {
          await emailService.sendOrderConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email via webhook:', emailError);
      }
    }
  } catch (error: any) {
    console.error('Error handling payment captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(payment: any) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      console.error('Order ID not found in payment notes');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Log payment failure
    console.log(`Payment failed for order ${orderId}: ${payment.error_description || 'Unknown error'}`);
    
    // Optionally update order status or send notification
    // You can add a paymentAttempts field to track retries
  } catch (error: any) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(order: any) {
  try {
    const orderId = order.notes?.orderId;
    if (!orderId) {
      console.error('Order ID not found in order notes');
      return;
    }

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    if (!dbOrder.isPaid) {
      dbOrder.isPaid = true;
      dbOrder.paidAt = new Date();
      await dbOrder.save();
      console.log(`Order ${orderId} marked as paid via order.paid webhook`);
    }
  } catch (error: any) {
    console.error('Error handling order paid:', error);
  }
}

// Handle refund created event
async function handleRefundCreated(refund: any) {
  try {
    const paymentId = refund.payment_id;
    const order = await Order.findOne({ 'paymentResult.id': paymentId });
    
    if (!order) {
      console.error(`Order not found for payment: ${paymentId}`);
      return;
    }

    // Update order with refund information
    if (!order.refund) {
      order.refund = {
        id: refund.id,
        amount: refund.amount / 100, // Convert from paise to rupees
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000),
        notes: refund.notes || {},
      };
      await order.save();
      console.log(`Refund created for order ${order._id}`);
    }
  } catch (error: any) {
    console.error('Error handling refund created:', error);
  }
}

// Handle refund processed event
async function handleRefundProcessed(refund: any) {
  try {
    const paymentId = refund.payment_id;
    const order = await Order.findOne({ 'paymentResult.id': paymentId });
    
    if (!order) {
      console.error(`Order not found for payment: ${paymentId}`);
      return;
    }

    if (order.refund) {
      order.refund.status = refund.status;
      order.refund.processedAt = new Date(refund.processed_at * 1000);
      
      if (refund.status === 'processed') {
        order.status = 'Refunded';
      }
      
      await order.save();
      console.log(`Refund processed for order ${order._id}`);
    }
  } catch (error: any) {
    console.error('Error handling refund processed:', error);
  }
}

// POST /api/payments/refund - Create refund (Admin only)
router.post('/refund', protect, admin, validate(paymentSchemas.refund), async (req: any, res) => {
  try {
    const { orderId, amount, reason, notes } = sanitizeObject(req.body);

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order is not paid' });
    }

    if (!order.paymentResult?.id) {
      return res.status(400).json({ message: 'Payment ID not found' });
    }

    // Amount validation
    const refundAmount = amount || order.totalPrice;
    const amountValidation = validateAmount(refundAmount);
    if (!amountValidation.valid) {
      return res.status(400).json({ message: amountValidation.error });
    }

    if (refundAmount > order.totalPrice) {
      return res.status(400).json({ message: 'Refund amount cannot exceed order total' });
    }

    // Convert amount to paise
    const amountInPaise = Math.round(refundAmount * 100);

    // Create refund via Razorpay
    const refundOptions: any = {
      payment_id: order.paymentResult.id,
      amount: amountInPaise,
      notes: {
        orderId: orderId.toString(),
        reason: reason || 'Customer request',
        ...notes,
      },
    };

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment gateway is not configured. Please contact support.' 
      });
    }

    const razorpayRefund = await razorpay.payments.refund(order.paymentResult.id, refundOptions);

    // Update order with refund information
    order.refund = {
      id: razorpayRefund.id,
      amount: refundAmount,
      status: razorpayRefund.status,
      createdAt: new Date(),
      notes: {
        reason: reason || 'Customer request',
        ...notes,
      },
    };

    if (razorpayRefund.status === 'processed') {
      order.status = 'Refunded';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      refund: {
        id: razorpayRefund.id,
        amount: refundAmount,
        status: razorpayRefund.status,
      },
      order: order,
    });
  } catch (error: any) {
    console.error('Refund creation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create refund',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/payments/refund/:orderId - Get refund status
router.get('/refund/:orderId', protect, validateParams(paramSchemas.orderId), async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.refund) {
      return res.status(404).json({ message: 'No refund found for this order' });
    }

    res.json({
      refund: order.refund,
    });
  } catch (error: any) {
    console.error('Get refund error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get refund status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;

