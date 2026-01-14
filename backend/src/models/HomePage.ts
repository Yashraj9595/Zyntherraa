import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string; // Optional separate image for mobile
  buttonText?: string;
  buttonLink?: string;
  order: number; // For ordering banners
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeaturedProduct extends Document {
  productId: string; // Reference to Product
  order: number; // For ordering featured products
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHomePageSection extends Document {
  type: 'banner' | 'featured' | 'category' | 'collections' | 'watch-and-shop' | 'custom';
  title?: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  config?: Record<string, any>; // Flexible config for different section types
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  mobileImage: {
    type: String
  },
  buttonText: {
    type: String,
    trim: true
  },
  buttonLink: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const featuredProductSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const homePageSectionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['banner', 'featured', 'category', 'collections', 'watch-and-shop', 'custom'],
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export interface IWatchAndShop extends Document {
  title: string;
  description?: string;
  videoUrl?: string; // Video URL (YouTube, Vimeo, or uploaded video)
  imageUrl?: string; // Thumbnail/cover image
  productId: string; // Reference to Product
  productImage?: string; // Product thumbnail to show
  productPrice?: number; // Product price to display
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const watchAndShopSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productImage: {
    type: String,
    trim: true
  },
  productPrice: {
    type: Number,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export const FeaturedProduct = mongoose.model<IFeaturedProduct>('FeaturedProduct', featuredProductSchema);
export const HomePageSection = mongoose.model<IHomePageSection>('HomePageSection', homePageSectionSchema);
export const WatchAndShop = mongoose.model<IWatchAndShop>('WatchAndShop', watchAndShopSchema);

