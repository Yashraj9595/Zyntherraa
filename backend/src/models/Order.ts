import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress: string;
  };
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    processedAt?: Date;
    notes?: Record<string, any>;
  };
  paymentAttempts?: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status?: string;
  trackingNumber?: string;
  trackingHistory?: Array<{
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
  }>;
  carrier?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema: Schema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  size: String,
  color: String
});

const orderSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  refund: {
    id: String,
    amount: Number,
    status: String,
    createdAt: Date,
    processedAt: Date,
    notes: Schema.Types.Mixed
  },
  paymentAttempts: {
    type: Number,
    default: 0
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  carrier: {
    type: String,
    default: 'Standard Shipping'
  },
  estimatedDelivery: {
    type: Date
  }
}, {
  timestamps: true
});

// Database indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ trackingNumber: 1 }, { unique: true, sparse: true });
orderSchema.index({ isPaid: 1, isDelivered: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ createdAt: -1 });

// Compound index for common queries
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

// Generate unique tracking number
orderSchema.methods.generateTrackingNumber = function() {
  const prefix = 'ZYN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Add tracking history entry
orderSchema.methods.addTrackingHistory = function(status: string, location?: string, description?: string) {
  if (!this.trackingHistory) {
    this.trackingHistory = [];
  }
  
  this.trackingHistory.push({
    status,
    location,
    timestamp: new Date(),
    description
  });
  
  return this.save();
};

export default mongoose.model<IOrder>('Order', orderSchema);