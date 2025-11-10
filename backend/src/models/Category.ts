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
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

export default mongoose.model<ICategory>('Category', categorySchema);