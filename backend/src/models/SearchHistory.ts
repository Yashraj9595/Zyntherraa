import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  user: mongoose.Types.ObjectId;
  query: string;
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    brand?: string;
  };
  resultCount?: number;
  clicked?: boolean;
  clickedProductId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const searchHistorySchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  filters: {
    category: String,
    minPrice: Number,
    maxPrice: Number,
    size: String,
    color: String,
    brand: String,
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  clicked: {
    type: Boolean,
    default: false,
  },
  clickedProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
}, {
  timestamps: true,
});

// Index for faster queries
searchHistorySchema.index({ user: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ createdAt: -1 });

// Keep only last 50 searches per user
searchHistorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('SearchHistory').countDocuments({ user: this.user });
    if (count >= 50) {
      // Delete oldest search
      const oldest = await mongoose.model('SearchHistory')
        .findOne({ user: this.user })
        .sort({ createdAt: 1 });
      if (oldest) {
        await mongoose.model('SearchHistory').findByIdAndDelete(oldest._id);
      }
    }
  }
  next();
});

const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);

export default SearchHistory;

