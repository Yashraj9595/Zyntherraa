import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchAnalytics extends Document {
  query: string;
  count: number;
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    brand?: string;
  };
  avgResultCount: number;
  clickThroughRate: number; // Percentage of searches that resulted in clicks
  lastSearched: Date;
  createdAt: Date;
  updatedAt: Date;
}

const searchAnalyticsSchema: Schema = new Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  filters: {
    category: String,
    minPrice: Number,
    maxPrice: Number,
    size: String,
    color: String,
    brand: String,
  },
  avgResultCount: {
    type: Number,
    default: 0,
  },
  clickThroughRate: {
    type: Number,
    default: 0,
  },
  lastSearched: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
searchAnalyticsSchema.index({ count: -1 });
searchAnalyticsSchema.index({ lastSearched: -1 });
searchAnalyticsSchema.index({ clickThroughRate: -1 });

const SearchAnalytics = mongoose.model<ISearchAnalytics>('SearchAnalytics', searchAnalyticsSchema);

export default SearchAnalytics;

