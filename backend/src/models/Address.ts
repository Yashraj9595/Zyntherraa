import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  label: string; // e.g., "Home", "Work", "Office"
  fullName: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Database indexes for performance
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, createdAt: -1 });
addressSchema.index({ user: 1 }); // General user lookup

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Unset other default addresses for this user
    await mongoose.model('Address').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model<IAddress>('Address', addressSchema);

export default Address;

