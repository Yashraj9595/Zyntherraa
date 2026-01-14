import mongoose, { Schema, Document } from 'mongoose';

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId;
  variantIndex: number; // Index of variant in product.variants array
  size: string;
  color: string;
  changeType: 'deduct' | 'add' | 'adjust' | 'reserve' | 'release';
  quantity: number;
  previousStock: number;
  newStock: number;
  orderId?: mongoose.Types.ObjectId;
  reason?: string;
  notes?: string;
  createdAt: Date;
}

const stockHistorySchema: Schema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  variantIndex: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  changeType: {
    type: String,
    enum: ['deduct', 'add', 'adjust', 'reserve', 'release'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  reason: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
stockHistorySchema.index({ product: 1, createdAt: -1 });
stockHistorySchema.index({ orderId: 1 });

const StockHistory = mongoose.model<IStockHistory>('StockHistory', stockHistorySchema);

export default StockHistory;

