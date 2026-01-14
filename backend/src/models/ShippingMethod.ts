import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingRate {
  minWeight?: number; // in kg
  maxWeight?: number; // in kg
  minPrice?: number; // minimum order value for this rate
  maxPrice?: number; // maximum order value for this rate
  basePrice: number; // base shipping cost
  perKgPrice?: number; // additional cost per kg
  perItemPrice?: number; // additional cost per item
  estimatedDays: number; // estimated delivery days
}

export interface IShippingMethod extends Document {
  name: string;
  code: string; // e.g., 'standard', 'express', 'overnight'
  description?: string;
  zone: mongoose.Types.ObjectId; // Reference to ShippingZone
  rates: IShippingRate[];
  freeShippingThreshold?: number; // Order value threshold for free shipping
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shippingRateSchema: Schema = new Schema({
  minWeight: {
    type: Number,
    min: 0,
  },
  maxWeight: {
    type: Number,
    min: 0,
  },
  minPrice: {
    type: Number,
    min: 0,
  },
  maxPrice: {
    type: Number,
    min: 0,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  perKgPrice: {
    type: Number,
    min: 0,
  },
  perItemPrice: {
    type: Number,
    min: 0,
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

const shippingMethodSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingZone',
    required: true,
    index: true,
  },
  rates: [shippingRateSchema],
  freeShippingThreshold: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
shippingMethodSchema.index({ zone: 1, isActive: 1 });
shippingMethodSchema.index({ code: 1 });

const ShippingMethod = mongoose.model<IShippingMethod>('ShippingMethod', shippingMethodSchema);

export default ShippingMethod;

