import express, { Router } from 'express';
const router: Router = express.Router();
import { protect, admin } from '../middleware/auth';
import { getLowStockProducts, getOutOfStockProducts } from '../utils/inventoryManager';
import StockHistory from '../models/StockHistory';
import Product from '../models/Product';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateParams } from '../middleware/validation';
import { paramSchemas } from '../utils/validationSchemas';
import logger, { logRequest } from '../utils/logger';

// GET /api/inventory/low-stock - Get low stock products
router.get(
  '/low-stock',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const lowStockItems = await getLowStockProducts(threshold);

    logRequest(req, 'Low stock products retrieved', 'info', { threshold, count: lowStockItems.length });

    res.json({
      success: true,
      threshold,
      count: lowStockItems.length,
      items: lowStockItems.map((item) => ({
        productId: item.product._id,
        productTitle: item.product.title,
        category: item.product.category,
        size: item.variant.size,
        color: item.variant.color,
        stock: item.stock,
        price: item.variant.price,
      })),
    });
  })
);

// GET /api/inventory/out-of-stock - Get out of stock products
router.get(
  '/out-of-stock',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const outOfStockItems = await getOutOfStockProducts();

    logRequest(req, 'Out of stock products retrieved', 'info', { count: outOfStockItems.length });

    res.json({
      success: true,
      count: outOfStockItems.length,
      items: outOfStockItems.map((item) => ({
        productId: item.product._id,
        productTitle: item.product.title,
        category: item.product.category,
        size: item.variant.size,
        color: item.variant.color,
        price: item.variant.price,
      })),
    });
  })
);

// GET /api/inventory/history/:productId - Get stock history for a product
router.get(
  '/history/:productId',
  protect,
  admin,
  validateParams(paramSchemas.id),
  asyncHandler(async (req: any, res) => {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const history = await StockHistory.find({ product: productId })
      .populate('orderId', 'trackingNumber status')
      .sort({ createdAt: -1 })
      .limit(limit);

    logRequest(req, 'Stock history retrieved', 'info', { productId, count: history.length });

    res.json({
      success: true,
      product: {
        id: product._id,
        title: product.title,
      },
      history: history.map((entry) => ({
        id: entry._id,
        variantIndex: entry.variantIndex,
        size: entry.size,
        color: entry.color,
        changeType: entry.changeType,
        quantity: entry.quantity,
        previousStock: entry.previousStock,
        newStock: entry.newStock,
        orderId: entry.orderId?._id,
        orderTrackingNumber: (entry.orderId as any)?.trackingNumber,
        reason: entry.reason,
        notes: entry.notes,
        createdAt: entry.createdAt,
      })),
    });
  })
);

// GET /api/inventory/alerts - Get all inventory alerts
router.get(
  '/alerts',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const [lowStockItems, outOfStockItems] = await Promise.all([
      getLowStockProducts(threshold),
      getOutOfStockProducts(),
    ]);

    logRequest(req, 'Inventory alerts retrieved', 'info', {
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
    });

    res.json({
      success: true,
      alerts: {
        lowStock: {
          count: lowStockItems.length,
          threshold,
          items: lowStockItems.map((item) => ({
            productId: item.product._id,
            productTitle: item.product.title,
            size: item.variant.size,
            color: item.variant.color,
            stock: item.stock,
          })),
        },
        outOfStock: {
          count: outOfStockItems.length,
          items: outOfStockItems.map((item) => ({
            productId: item.product._id,
            productTitle: item.product.title,
            size: item.variant.size,
            color: item.variant.color,
          })),
        },
      },
    });
  })
);

export default router;

