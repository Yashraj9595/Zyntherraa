import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlistItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant?: {
    size?: string;
    color?: string;
  };
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    size: String,
    color: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

// Database indexes for performance
WishlistSchema.index({ user: 1 }, { unique: true });
WishlistSchema.index({ 'items.product': 1 });
WishlistSchema.index({ updatedAt: -1 });

// Prevent duplicate items in wishlist
WishlistSchema.methods.addItem = async function (productId: string, variant?: { size?: string; color?: string }) {
  // Check if item already exists
  const existingItem = this.items.find((item: IWishlistItem) => {
    if (item.product.toString() !== productId) return false;
    if (variant) {
      return (
        item.variant?.size === variant.size &&
        item.variant?.color === variant.color
      );
    }
    return !item.variant || (!item.variant.size && !item.variant.color);
  });

  if (existingItem) {
    throw new Error('Item already in wishlist');
  }

  this.items.push({
    product: productId,
    variant,
    addedAt: new Date(),
  });

  return this.save();
};

// Remove item from wishlist
WishlistSchema.methods.removeItem = async function (itemId: string) {
  this.items = this.items.filter(
    (item: IWishlistItem) => item._id?.toString() !== itemId
  );
  return this.save();
};

// Clear wishlist
WishlistSchema.methods.clear = async function () {
  this.items = [];
  return this.save();
};

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;

