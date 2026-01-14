import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { protect } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validation';
import { sanitizeObject } from '../utils/sanitize';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import Joi from 'joi';

// Validation schemas
const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  variant: Joi.object({
    size: Joi.string().optional(),
    color: Joi.string().optional(),
  }).optional(),
});

// GET /api/wishlist - Get user's wishlist
router.get(
  '/',
  protect,
  asyncHandler(async (req: any, res: Response) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product',
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [],
      });
    }

    logRequest(req, 'Wishlist retrieved', 'info', {
      itemCount: wishlist.items.length,
    });

    res.json({
      success: true,
      wishlist: {
        id: wishlist._id,
        items: wishlist.items,
        itemCount: wishlist.items.length,
      },
    });
  })
);

// POST /api/wishlist - Add item to wishlist
router.post(
  '/',
  protect,
  validate(addItemSchema),
  asyncHandler(async (req: any, res: Response) => {
    const { productId, variant } = sanitizeObject(req.body);

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [],
      });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find((item) => {
      if (item.product.toString() !== productId) return false;
      if (variant) {
        return (
          item.variant?.size === variant.size &&
          item.variant?.color === variant.color
        );
      }
      return !item.variant || (!item.variant.size && !item.variant.color);
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist',
      });
    }

    // Add item
    wishlist.items.push({
      product: productId,
      variant: variant || undefined,
      addedAt: new Date(),
    });

    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: 'items.product',
      model: 'Product',
    });

    const addedItem = wishlist.items[wishlist.items.length - 1];

    logRequest(req, 'Item added to wishlist', 'info', {
      productId,
      itemId: addedItem._id,
    });

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      item: addedItem,
    });
  })
);

// DELETE /api/wishlist/:itemId - Remove item from wishlist
router.delete(
  '/:itemId',
  protect,
  asyncHandler(async (req: any, res: Response) => {
    const { itemId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
    }

    const itemExists = wishlist.items.some(
      (item) => item._id?.toString() === itemId
    );
    if (!itemExists) {
      throw new AppError('Item not found in wishlist', 404, 'ITEM_NOT_FOUND');
    }

    wishlist.items = wishlist.items.filter(
      (item) => item._id?.toString() !== itemId
    );
    await wishlist.save();

    logRequest(req, 'Item removed from wishlist', 'info', { itemId });

    res.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  })
);

// DELETE /api/wishlist - Clear entire wishlist
router.delete(
  '/',
  protect,
  asyncHandler(async (req: any, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
    }

    wishlist.items = [];
    await wishlist.save();

    logRequest(req, 'Wishlist cleared', 'info');

    res.json({
      success: true,
      message: 'Wishlist cleared',
    });
  })
);

// POST /api/wishlist/:itemId/move-to-cart - Move wishlist item to cart
router.post(
  '/:itemId/move-to-cart',
  protect,
  asyncHandler(async (req: any, res: Response) => {
    const { itemId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product',
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
    }

    const item = wishlist.items.find(
      (item) => item._id?.toString() === itemId
    );
    if (!item) {
      throw new AppError('Item not found in wishlist', 404, 'ITEM_NOT_FOUND');
    }

    const product = item.product as any;
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Remove from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item._id?.toString() !== itemId
    );
    await wishlist.save();

    logRequest(req, 'Item moved to cart from wishlist', 'info', {
      itemId,
      productId: product._id,
    });

    // Return product details for frontend to add to cart
    res.json({
      success: true,
      message: 'Item moved to cart',
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
        variant: item.variant,
      },
    });
  })
);

// GET /api/wishlist/count - Get wishlist item count
router.get(
  '/count',
  protect,
  asyncHandler(async (req: any, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const count = wishlist ? wishlist.items.length : 0;

    res.json({
      success: true,
      count,
    });
  })
);

export default router;

