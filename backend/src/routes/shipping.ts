import express, { Router } from 'express';
const router: Router = express.Router();
import ShippingZone from '../models/ShippingZone';
import ShippingMethod from '../models/ShippingMethod';
import { protect, admin } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { sanitizeObject } from '../utils/sanitize';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { calculateShipping, getAvailableShippingMethods } from '../utils/shippingCalculator';
import Joi from 'joi';

// Validation schemas
const calculateShippingSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    country: Joi.string().required(),
    city: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    state: Joi.string().optional(),
  }).required(),
  shippingMethod: Joi.string().optional(),
  orderValue: Joi.number().min(0).required(),
});

// POST /api/shipping/calculate - Calculate shipping cost
router.post(
  '/calculate',
  validate(calculateShippingSchema),
  asyncHandler(async (req: any, res) => {
    const { items, shippingAddress, shippingMethod, orderValue } = sanitizeObject(req.body);

    const result = await calculateShipping({
      items,
      shippingAddress,
      shippingMethod,
      orderValue,
    });

    logRequest(req, 'Shipping calculated', 'info', {
      shippingPrice: result.shippingPrice,
      method: result.method.code,
      isFreeShipping: result.isFreeShipping,
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

// GET /api/shipping/methods - Get available shipping methods for address
router.get(
  '/methods',
  validateQuery(
    Joi.object({
      country: Joi.string().required(),
      city: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      state: Joi.string().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { country, city, postalCode, state } = sanitizeObject(req.query);

    const methods = await getAvailableShippingMethods({
      country,
      city,
      postalCode,
      state,
    });

    logRequest(req, 'Shipping methods retrieved', 'info', { count: methods.length });

    res.json({
      success: true,
      methods,
    });
  })
);

// ============================================
// ADMIN ROUTES - Shipping Zone Management
// ============================================

// GET /api/shipping/zones - Get all shipping zones
router.get(
  '/zones',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const zones = await ShippingZone.find({}).sort({ name: 1 });

    logRequest(req, 'Shipping zones retrieved', 'info', { count: zones.length });

    res.json({
      success: true,
      zones: zones.map(zone => ({
        id: zone._id,
        name: zone.name,
        countries: zone.countries,
        states: zone.states,
        cities: zone.cities,
        postalCodes: zone.postalCodes,
        isActive: zone.isActive,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt,
      })),
    });
  })
);

// POST /api/shipping/zones - Create shipping zone
router.post(
  '/zones',
  protect,
  admin,
  validate(
    Joi.object({
      name: Joi.string().required(),
      countries: Joi.array().items(Joi.string().uppercase()).min(1).required(),
      states: Joi.array().items(Joi.string()).optional(),
      cities: Joi.array().items(Joi.string()).optional(),
      postalCodes: Joi.array().items(Joi.string()).optional(),
      isActive: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { name, countries, states, cities, postalCodes, isActive } = sanitizeObject(req.body);

    const zone = new ShippingZone({
      name,
      countries,
      states,
      cities,
      postalCodes,
      isActive: isActive !== undefined ? isActive : true,
    });

    await zone.save();

    logRequest(req, 'Shipping zone created', 'info', { zoneId: zone._id });

    res.status(201).json({
      success: true,
      zone: {
        id: zone._id,
        name: zone.name,
        countries: zone.countries,
        states: zone.states,
        cities: zone.cities,
        postalCodes: zone.postalCodes,
        isActive: zone.isActive,
      },
    });
  })
);

// PUT /api/shipping/zones/:id - Update shipping zone
router.put(
  '/zones/:id',
  protect,
  admin,
  validate(
    Joi.object({
      name: Joi.string().optional(),
      countries: Joi.array().items(Joi.string().uppercase()).optional(),
      states: Joi.array().items(Joi.string()).optional(),
      cities: Joi.array().items(Joi.string()).optional(),
      postalCodes: Joi.array().items(Joi.string()).optional(),
      isActive: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const updates = sanitizeObject(req.body);

    const zone = await ShippingZone.findByIdAndUpdate(id, updates, { new: true });

    if (!zone) {
      throw new AppError('Shipping zone not found', 404, 'NOT_FOUND');
    }

    logRequest(req, 'Shipping zone updated', 'info', { zoneId: zone._id });

    res.json({
      success: true,
      zone: {
        id: zone._id,
        name: zone.name,
        countries: zone.countries,
        states: zone.states,
        cities: zone.cities,
        postalCodes: zone.postalCodes,
        isActive: zone.isActive,
      },
    });
  })
);

// DELETE /api/shipping/zones/:id - Delete shipping zone
router.delete(
  '/zones/:id',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const zone = await ShippingZone.findById(id);
    if (!zone) {
      throw new AppError('Shipping zone not found', 404, 'NOT_FOUND');
    }

    // Check if zone has shipping methods
    const methodsCount = await ShippingMethod.countDocuments({ zone: id });
    if (methodsCount > 0) {
      throw new AppError(
        'Cannot delete zone with shipping methods. Delete methods first.',
        400,
        'ZONE_IN_USE'
      );
    }

    await ShippingZone.findByIdAndDelete(id);

    logRequest(req, 'Shipping zone deleted', 'info', { zoneId: id });

    res.json({
      success: true,
      message: 'Shipping zone deleted',
    });
  })
);

// ============================================
// ADMIN ROUTES - Shipping Method Management
// ============================================

// GET /api/shipping/methods/admin - Get all shipping methods (admin)
router.get(
  '/methods/admin',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const methods = await ShippingMethod.find({})
      .populate('zone', 'name countries')
      .sort({ zone: 1, createdAt: 1 });

    logRequest(req, 'Shipping methods retrieved (admin)', 'info', { count: methods.length });

    res.json({
      success: true,
      methods: methods.map(method => ({
        id: method._id,
        name: method.name,
        code: method.code,
        description: method.description,
        zone: {
          id: (method.zone as any)._id,
          name: (method.zone as any).name,
          countries: (method.zone as any).countries,
        },
        rates: method.rates,
        freeShippingThreshold: method.freeShippingThreshold,
        isActive: method.isActive,
        createdAt: method.createdAt,
        updatedAt: method.updatedAt,
      })),
    });
  })
);

// POST /api/shipping/methods - Create shipping method
router.post(
  '/methods',
  protect,
  admin,
  validate(
    Joi.object({
      name: Joi.string().required(),
      code: Joi.string().lowercase().required(),
      description: Joi.string().optional(),
      zone: Joi.string().required(),
      rates: Joi.array()
        .items(
          Joi.object({
            minWeight: Joi.number().min(0).optional(),
            maxWeight: Joi.number().min(0).optional(),
            minPrice: Joi.number().min(0).optional(),
            maxPrice: Joi.number().min(0).optional(),
            basePrice: Joi.number().min(0).required(),
            perKgPrice: Joi.number().min(0).optional(),
            perItemPrice: Joi.number().min(0).optional(),
            estimatedDays: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
      freeShippingThreshold: Joi.number().min(0).optional(),
      isActive: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { name, code, description, zone, rates, freeShippingThreshold, isActive } = sanitizeObject(req.body);

    // Verify zone exists
    const zoneDoc = await ShippingZone.findById(zone);
    if (!zoneDoc) {
      throw new AppError('Shipping zone not found', 404, 'ZONE_NOT_FOUND');
    }

    const method = new ShippingMethod({
      name,
      code,
      description,
      zone,
      rates,
      freeShippingThreshold,
      isActive: isActive !== undefined ? isActive : true,
    });

    await method.save();
    await method.populate('zone', 'name countries');

    logRequest(req, 'Shipping method created', 'info', { methodId: method._id });

    res.status(201).json({
      success: true,
      method: {
        id: method._id,
        name: method.name,
        code: method.code,
        description: method.description,
        zone: {
          id: (method.zone as any)._id,
          name: (method.zone as any).name,
        },
        rates: method.rates,
        freeShippingThreshold: method.freeShippingThreshold,
        isActive: method.isActive,
      },
    });
  })
);

// PUT /api/shipping/methods/:id - Update shipping method
router.put(
  '/methods/:id',
  protect,
  admin,
  validate(
    Joi.object({
      name: Joi.string().optional(),
      code: Joi.string().lowercase().optional(),
      description: Joi.string().optional(),
      zone: Joi.string().optional(),
      rates: Joi.array()
        .items(
          Joi.object({
            minWeight: Joi.number().min(0).optional(),
            maxWeight: Joi.number().min(0).optional(),
            minPrice: Joi.number().min(0).optional(),
            maxPrice: Joi.number().min(0).optional(),
            basePrice: Joi.number().min(0).required(),
            perKgPrice: Joi.number().min(0).optional(),
            perItemPrice: Joi.number().min(0).optional(),
            estimatedDays: Joi.number().integer().min(1).required(),
          })
        )
        .optional(),
      freeShippingThreshold: Joi.number().min(0).optional(),
      isActive: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const updates = sanitizeObject(req.body);

    // If zone is being updated, verify it exists
    if (updates.zone) {
      const zoneDoc = await ShippingZone.findById(updates.zone);
      if (!zoneDoc) {
        throw new AppError('Shipping zone not found', 404, 'ZONE_NOT_FOUND');
      }
    }

    const method = await ShippingMethod.findByIdAndUpdate(id, updates, { new: true })
      .populate('zone', 'name countries');

    if (!method) {
      throw new AppError('Shipping method not found', 404, 'NOT_FOUND');
    }

    logRequest(req, 'Shipping method updated', 'info', { methodId: method._id });

    res.json({
      success: true,
      method: {
        id: method._id,
        name: method.name,
        code: method.code,
        description: method.description,
        zone: {
          id: (method.zone as any)._id,
          name: (method.zone as any).name,
        },
        rates: method.rates,
        freeShippingThreshold: method.freeShippingThreshold,
        isActive: method.isActive,
      },
    });
  })
);

// DELETE /api/shipping/methods/:id - Delete shipping method
router.delete(
  '/methods/:id',
  protect,
  admin,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const method = await ShippingMethod.findById(id);
    if (!method) {
      throw new AppError('Shipping method not found', 404, 'NOT_FOUND');
    }

    await ShippingMethod.findByIdAndDelete(id);

    logRequest(req, 'Shipping method deleted', 'info', { methodId: id });

    res.json({
      success: true,
      message: 'Shipping method deleted',
    });
  })
);

export default router;

