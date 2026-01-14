import Product, { IProduct } from '../models/Product';
import StockHistory from '../models/StockHistory';
import Order from '../models/Order';
import logger from './logger';

export interface StockValidationResult {
  valid: boolean;
  errors: Array<{
    productId: string;
    productTitle: string;
    size: string;
    color: string;
    requested: number;
    available: number;
  }>;
}

/**
 * Validate stock availability for order items
 */
export async function validateStockAvailability(
  items: Array<{
    product: string;
    size?: string;
    color?: string;
    quantity: number;
  }>
): Promise<StockValidationResult> {
  const errors: StockValidationResult['errors'] = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      errors.push({
        productId: item.product,
        productTitle: 'Unknown Product',
        size: item.size || '',
        color: item.color || '',
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    // Find matching variant
    const variant = product.variants.find(
      (v) => v.size === item.size && v.color === item.color
    );

    if (!variant) {
      errors.push({
        productId: item.product,
        productTitle: product.title,
        size: item.size || '',
        color: item.color || '',
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    if (variant.stock < item.quantity) {
      errors.push({
        productId: item.product,
        productTitle: product.title,
        size: item.size || '',
        color: item.color || '',
        requested: item.quantity,
        available: variant.stock,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deduct stock for order items
 */
export async function deductStock(
  items: Array<{
    product: string;
    size?: string;
    color?: string;
    quantity: number;
  }>,
  orderId: string,
  reason: string = 'Order placed'
): Promise<void> {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      logger.warn(`Product not found for stock deduction: ${item.product}`);
      continue;
    }

    // Find matching variant
    const variantIndex = product.variants.findIndex(
      (v) => v.size === item.size && v.color === item.color
    );

    if (variantIndex === -1) {
      logger.warn(`Variant not found for stock deduction: ${item.product} - ${item.size}/${item.color}`);
      continue;
    }

    const variant = product.variants[variantIndex];
    const previousStock = variant.stock;

    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.title} (${item.size}/${item.color}). Available: ${variant.stock}, Requested: ${item.quantity}`
      );
    }

    // Deduct stock
    variant.stock -= item.quantity;
    const newStock = variant.stock;

    await product.save();

    // Record stock history
    await StockHistory.create({
      product: product._id,
      variantIndex,
      size: item.size || '',
      color: item.color || '',
      changeType: 'deduct',
      quantity: item.quantity,
      previousStock,
      newStock,
      orderId,
      reason,
    });

    logger.info(`Stock deducted: ${product.title} (${item.size}/${item.color}) - ${item.quantity} units`, {
      productId: product._id.toString(),
      orderId,
      previousStock,
      newStock,
    });

    // Check for low stock and log alert
    const lowStockThreshold = 10; // Configurable
    if (newStock <= lowStockThreshold && newStock > 0) {
      logger.warn(`Low stock alert: ${product.title} (${item.size}/${item.color}) - ${newStock} units remaining`, {
        productId: product._id.toString(),
        variantIndex,
        stock: newStock,
      });
    }
  }
}

/**
 * Restore stock (for cancelled orders or refunds)
 */
export async function restoreStock(
  items: Array<{
    product: string;
    size?: string;
    color?: string;
    quantity: number;
  }>,
  orderId: string,
  reason: string = 'Order cancelled'
): Promise<void> {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      logger.warn(`Product not found for stock restoration: ${item.product}`);
      continue;
    }

    // Find matching variant
    const variantIndex = product.variants.findIndex(
      (v) => v.size === item.size && v.color === item.color
    );

    if (variantIndex === -1) {
      logger.warn(`Variant not found for stock restoration: ${item.product} - ${item.size}/${item.color}`);
      continue;
    }

    const variant = product.variants[variantIndex];
    const previousStock = variant.stock;

    // Restore stock
    variant.stock += item.quantity;
    const newStock = variant.stock;

    await product.save();

    // Record stock history
    await StockHistory.create({
      product: product._id,
      variantIndex,
      size: item.size || '',
      color: item.color || '',
      changeType: 'add',
      quantity: item.quantity,
      previousStock,
      newStock,
      orderId,
      reason,
    });

    logger.info(`Stock restored: ${product.title} (${item.size}/${item.color}) - ${item.quantity} units`, {
      productId: product._id.toString(),
      orderId,
      previousStock,
      newStock,
    });
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold: number = 10): Promise<Array<{
  product: IProduct;
  variantIndex: number;
  variant: any;
  stock: number;
}>> {
  const products = await Product.find({ status: 'Active' });
  const lowStockItems: Array<{
    product: IProduct;
    variantIndex: number;
    variant: any;
    stock: number;
  }> = [];

  for (const product of products) {
    product.variants.forEach((variant, index) => {
      if (variant.stock > 0 && variant.stock <= threshold) {
        lowStockItems.push({
          product,
          variantIndex: index,
          variant,
          stock: variant.stock,
        });
      }
    });
  }

  return lowStockItems.sort((a, b) => a.stock - b.stock);
}

/**
 * Get out of stock products
 */
export async function getOutOfStockProducts(): Promise<Array<{
  product: IProduct;
  variantIndex: number;
  variant: any;
}>> {
  const products = await Product.find({ status: 'Active' });
  const outOfStockItems: Array<{
    product: IProduct;
    variantIndex: number;
    variant: any;
  }> = [];

  for (const product of products) {
    product.variants.forEach((variant, index) => {
      if (variant.stock === 0) {
        outOfStockItems.push({
          product,
          variantIndex: index,
          variant,
        });
      }
    });
  }

  return outOfStockItems;
}

