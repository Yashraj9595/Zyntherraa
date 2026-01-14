import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import Order from '../models/Order';
import { protect } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import { paramSchemas } from '../utils/validationSchemas';
import { isValidTrackingNumber } from '../utils/trackingNumberGenerator';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// GET /api/tracking/:trackingNumber - Get order by tracking number (public)
router.get(
  '/:trackingNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;

    // Validate tracking number format
    if (!isValidTrackingNumber(trackingNumber)) {
      throw new AppError('Invalid tracking number format', 400, 'INVALID_TRACKING_NUMBER');
    }

    const order = await Order.findOne({ trackingNumber })
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'title images',
      });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    logRequest(req, 'Tracking lookup', 'info', { trackingNumber });

    // Return order details (limited information for security)
    res.json({
      success: true,
      order: {
        trackingNumber: order.trackingNumber,
        status: order.status,
        trackingHistory: order.trackingHistory || [],
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: {
          city: order.shippingAddress.city,
          country: order.shippingAddress.country,
          // Don't expose full address for security
        },
        items: order.items.map((item: any) => ({
          product: item.product?.title || 'Product',
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
      },
    });
  })
);

// GET /api/tracking/order/:orderId - Get tracking info for user's own order (authenticated)
router.get(
  '/order/:orderId',
  protect,
  validateParams(paramSchemas.id),
  asyncHandler(async (req: any, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    })
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'title images',
      });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    logRequest(req, 'User tracking lookup', 'info', { orderId, trackingNumber: order.trackingNumber });

    res.json({
      success: true,
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        trackingHistory: order.trackingHistory || [],
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: order.shippingAddress,
        items: order.items,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
      },
    });
  })
);

export default router;

