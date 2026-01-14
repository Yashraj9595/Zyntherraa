import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory {
  name: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  parentId: mongoose.Types.ObjectId;
}

export interface ICategory extends Document {
  name: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  image?: string; // Category image URL
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

const categorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  image: {
    type: String,
    trim: true
  },
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

// Database indexes for performance
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ status: 1 });
categorySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ICategory>('Category', categorySchema);