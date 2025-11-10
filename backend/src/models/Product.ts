import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  size: string;
  color: string;
  images: string[];
  videos: string[];
  price: number;
  stock: number;
  styleNumber?: string;
  fabric?: string;
}

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  variants: IProductVariant[];
  status: 'Active' | 'Inactive';
  styleNumber?: string;
  fabric?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema: Schema = new Schema({
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  styleNumber: {
    type: String
  },
  fabric: {
    type: String
  }
});

const productSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String
  },
  variants: [productVariantSchema],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  styleNumber: {
    type: String
  },
  fabric: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);