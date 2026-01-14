import ShippingZone from '../models/ShippingZone';
import ShippingMethod from '../models/ShippingMethod';
import Product from '../models/Product';
import logger from './logger';

export interface ShippingCalculationParams {
  items: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: {
    country: string;
    city?: string;
    postalCode?: string;
    state?: string;
  };
  shippingMethod?: string; // Method code (e.g., 'standard', 'express')
  orderValue: number; // Total order value
}

export interface ShippingCalculationResult {
  shippingPrice: number;
  method: {
    id: string;
    name: string;
    code: string;
    estimatedDays: number;
  };
  isFreeShipping: boolean;
  breakdown?: {
    basePrice: number;
    weightCharge?: number;
    itemCharge?: number;
    freeShippingThreshold?: number;
  };
}

// Default product weight in kg (if not specified)
const DEFAULT_PRODUCT_WEIGHT = 0.5; // 500g default

/**
 * Calculate shipping cost based on zone, method, weight, and order value
 */
export async function calculateShipping(
  params: ShippingCalculationParams
): Promise<ShippingCalculationResult> {
  try {
    const { items, shippingAddress, shippingMethod, orderValue } = params;

    // Find matching shipping zone
    const zone = await findShippingZone(shippingAddress);
    if (!zone) {
      logger.warn('No shipping zone found', { shippingAddress });
      // Return default shipping cost
      return {
        shippingPrice: 0,
        method: {
          id: '',
          name: 'Standard Shipping',
          code: 'standard',
          estimatedDays: 7,
        },
        isFreeShipping: false,
      };
    }

    // Get shipping methods for this zone
    const methods = await ShippingMethod.find({
      zone: zone._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    if (methods.length === 0) {
      logger.warn('No shipping methods found for zone', { zoneId: zone._id });
      return {
        shippingPrice: 0,
        method: {
          id: '',
          name: 'Standard Shipping',
          code: 'standard',
          estimatedDays: 7,
        },
        isFreeShipping: false,
      };
    }

    // Select shipping method (use provided or default to first)
    let selectedMethod = methods[0];
    if (shippingMethod) {
      const method = methods.find(m => m.code === shippingMethod);
      if (method) {
        selectedMethod = method;
      }
    }

    // Calculate total weight
    const totalWeight = await calculateTotalWeight(items);

    // Check for free shipping threshold
    if (selectedMethod.freeShippingThreshold && orderValue >= selectedMethod.freeShippingThreshold) {
      return {
        shippingPrice: 0,
        method: {
          id: selectedMethod._id.toString(),
          name: selectedMethod.name,
          code: selectedMethod.code,
          estimatedDays: selectedMethod.rates[0]?.estimatedDays || 7,
        },
        isFreeShipping: true,
        breakdown: {
          basePrice: 0,
          freeShippingThreshold: selectedMethod.freeShippingThreshold,
        },
      };
    }

    // Find applicable rate
    const rate = findApplicableRate(selectedMethod.rates, totalWeight, orderValue);
    if (!rate) {
      logger.warn('No applicable rate found', {
        methodId: selectedMethod._id,
        weight: totalWeight,
        orderValue,
      });
      return {
        shippingPrice: 0,
        method: {
          id: selectedMethod._id.toString(),
          name: selectedMethod.name,
          code: selectedMethod.code,
          estimatedDays: 7,
        },
        isFreeShipping: false,
      };
    }

    // Calculate shipping cost
    let shippingPrice = rate.basePrice;

    // Add weight-based charge
    if (rate.perKgPrice && totalWeight > 0) {
      shippingPrice += rate.perKgPrice * totalWeight;
    }

    // Add item-based charge
    if (rate.perItemPrice) {
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      shippingPrice += rate.perItemPrice * totalItems;
    }

    // Round to 2 decimal places
    shippingPrice = Math.round(shippingPrice * 100) / 100;

    return {
      shippingPrice,
      method: {
        id: selectedMethod._id.toString(),
        name: selectedMethod.name,
        code: selectedMethod.code,
        estimatedDays: rate.estimatedDays,
      },
      isFreeShipping: false,
      breakdown: {
        basePrice: rate.basePrice,
        weightCharge: rate.perKgPrice ? rate.perKgPrice * totalWeight : undefined,
        itemCharge: rate.perItemPrice ? rate.perItemPrice * items.reduce((sum, item) => sum + item.quantity, 0) : undefined,
      },
    };
  } catch (error: any) {
    logger.error('Shipping calculation error', { error: error.message, params });
    // Return default on error
    return {
      shippingPrice: 0,
      method: {
        id: '',
        name: 'Standard Shipping',
        code: 'standard',
        estimatedDays: 7,
      },
      isFreeShipping: false,
    };
  }
}

/**
 * Find shipping zone based on address
 */
async function findShippingZone(
  address: ShippingCalculationParams['shippingAddress']
): Promise<any> {
  const { country, city, postalCode, state } = address;
  const countryUpper = country.toUpperCase();

  // First, try exact match with all criteria
  let zone = await ShippingZone.findOne({
    isActive: true,
    countries: countryUpper,
    ...(state && { states: state }),
    ...(city && { cities: city }),
    ...(postalCode && { postalCodes: postalCode }),
  });

  if (zone) return zone;

  // Try with state only
  if (state) {
    zone = await ShippingZone.findOne({
      isActive: true,
      countries: countryUpper,
      states: state,
    });
    if (zone) return zone;
  }

  // Try with city only
  if (city) {
    zone = await ShippingZone.findOne({
      isActive: true,
      countries: countryUpper,
      cities: city,
    });
    if (zone) return zone;
  }

  // Try with postal code only
  if (postalCode) {
    zone = await ShippingZone.findOne({
      isActive: true,
      countries: countryUpper,
      postalCodes: postalCode,
    });
    if (zone) return zone;
  }

  // Finally, try country only
  zone = await ShippingZone.findOne({
    isActive: true,
    countries: countryUpper,
  });

  return zone;
}

/**
 * Calculate total weight of order items
 */
async function calculateTotalWeight(
  items: ShippingCalculationParams['items']
): Promise<number> {
  let totalWeight = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      // Use default weight if product not found
      totalWeight += DEFAULT_PRODUCT_WEIGHT * item.quantity;
      continue;
    }

    // For now, use default weight per item
    // In future, add weight field to Product model
    const itemWeight = DEFAULT_PRODUCT_WEIGHT;
    totalWeight += itemWeight * item.quantity;
  }

  return Math.round(totalWeight * 100) / 100; // Round to 2 decimal places
}

/**
 * Find applicable shipping rate
 */
function findApplicableRate(
  rates: any[],
  weight: number,
  orderValue: number
): any {
  // Sort rates by priority (more specific first)
  const sortedRates = [...rates].sort((a, b) => {
    // Prefer rates with weight/price constraints
    const aSpecificity = (a.minWeight !== undefined ? 1 : 0) + (a.maxWeight !== undefined ? 1 : 0) +
                         (a.minPrice !== undefined ? 1 : 0) + (a.maxPrice !== undefined ? 1 : 0);
    const bSpecificity = (b.minWeight !== undefined ? 1 : 0) + (b.maxWeight !== undefined ? 1 : 0) +
                         (b.minPrice !== undefined ? 1 : 0) + (b.maxPrice !== undefined ? 1 : 0);
    return bSpecificity - aSpecificity;
  });

  // Find first matching rate
  for (const rate of sortedRates) {
    // Check weight constraints
    if (rate.minWeight !== undefined && weight < rate.minWeight) continue;
    if (rate.maxWeight !== undefined && weight > rate.maxWeight) continue;

    // Check price constraints
    if (rate.minPrice !== undefined && orderValue < rate.minPrice) continue;
    if (rate.maxPrice !== undefined && orderValue > rate.maxPrice) continue;

    return rate;
  }

  // If no specific rate matches, return first rate (fallback)
  return rates[0] || null;
}

/**
 * Get available shipping methods for an address
 */
export async function getAvailableShippingMethods(
  shippingAddress: ShippingCalculationParams['shippingAddress']
): Promise<Array<{
  id: string;
  name: string;
  code: string;
  description?: string;
  estimatedDays: number;
  freeShippingThreshold?: number;
}>> {
  try {
    const zone = await findShippingZone(shippingAddress);
    if (!zone) {
      return [];
    }

    const methods = await ShippingMethod.find({
      zone: zone._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    return methods.map(method => ({
      id: method._id.toString(),
      name: method.name,
      code: method.code,
      description: method.description,
      estimatedDays: method.rates[0]?.estimatedDays || 7,
      freeShippingThreshold: method.freeShippingThreshold,
    }));
  } catch (error: any) {
    logger.error('Error getting shipping methods', { error: error.message });
    return [];
  }
}

