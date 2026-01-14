import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingZone extends Document {
  name: string;
  countries: string[]; // ISO country codes
  states?: string[]; // Optional state/province codes
  cities?: string[]; // Optional city names
  postalCodes?: string[]; // Optional postal code ranges
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shippingZoneSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  countries: [{
    type: String,
    required: true,
    uppercase: true, // Store as uppercase ISO codes (e.g., 'IN', 'US')
  }],
  states: [{
    type: String,
    trim: true,
  }],
  cities: [{
    type: String,
    trim: true,
  }],
  postalCodes: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
shippingZoneSchema.index({ countries: 1, isActive: 1 });
shippingZoneSchema.index({ name: 1 });

const ShippingZone = mongoose.model<IShippingZone>('ShippingZone', shippingZoneSchema);

export default ShippingZone;

