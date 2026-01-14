import express, { Router } from 'express';
const router: Router = express.Router();
import User, { IUser } from '../models/User';
import Address from '../models/Address';
import Order from '../models/Order';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { protect, admin } from '../middleware/auth';
import emailService from '../utils/emailService';
import { validate, validateParams } from '../middleware/validation';
import { userSchemas, paramSchemas } from '../utils/validationSchemas';
import { sanitizeObject } from '../utils/sanitize';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import Joi from 'joi';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'zyntherraa_jwt_secret', {
    expiresIn: '30d',
  });
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// GET /api/users - Get all users (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/register - Register a new user (sends OTP)
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    // Data is already validated and sanitized by middleware
    const { name, email, password, phone } = sanitizeObject(req.body);
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user (not verified yet)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      isVerified: false,
      otp,
      otpExpire
    });
    
    const savedUser = await user.save();
    
    // Send OTP email
    const emailSent = await emailService.sendOTP(email, otp, 'registration');
    
    if (!emailSent) {
      console.error('Failed to send OTP email');
      // Still return success but log the error
    }
    
    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent to your email.',
      userId: savedUser._id,
      email: savedUser.email,
      // In development, return OTP for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/users/verify-otp - Verify OTP for registration
router.post('/verify-otp', validate(userSchemas.verifyOTP), async (req, res) => {
  try {
    const { email, otp } = sanitizeObject(req.body);
    
    const user = await User.findOne({ 
      email,
      otp,
      otpExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    
    // Send welcome email
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name,
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Email verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/resend-otp - Resend OTP
router.post('/resend-otp', validate(userSchemas.resendOTP), async (req, res) => {
  try {
    const { email, purpose } = sanitizeObject(req.body);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        message: 'If an account with that email exists, an OTP has been sent.' 
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to user
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    
    // Send OTP email
    const emailSent = await emailService.sendOTP(
      email, 
      otp, 
      (purpose || 'registration') as 'registration' | 'login' | 'password-reset'
    );
    
    if (!emailSent) {
      console.error('Failed to send OTP email');
    }
    
    res.json({ 
      message: 'OTP has been sent to your email.',
      // In development, return OTP for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/login - Authenticate user
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = sanitizeObject(req.body);
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is verified
    // Admin users are auto-verified, skip OTP for them
    if (!user.isVerified && user.role !== 'admin') {
      // Generate OTP for verification
      const otp = generateOTP();
      const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
      
      // Send OTP email
      await emailService.sendOTP(email, otp, 'registration');
      
      return res.status(200).json({
        message: 'Please verify your email with the OTP sent to your email.',
        requiresVerification: true,
        email: user.email,
        // In development, return OTP for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
    
    // Auto-verify admin users if not already verified
    if (!user.isVerified && user.role === 'admin') {
      user.isVerified = true;
      await user.save();
    }
    
    // User is verified, login directly
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/verify-login-otp - Verify OTP for login
router.post('/verify-login-otp', validate(userSchemas.verifyLoginOTP), async (req, res) => {
  try {
    const { email, otp } = sanitizeObject(req.body);
    
    const user = await User.findOne({ 
      email,
      otp,
      otpExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', protect, async (req: any, res) => {
  try {
    // req.user is set by the protect middleware
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/profile - Update user profile
router.put(
  '/profile',
  protect,
  validate(
    Joi.object({
      name: Joi.string().trim().min(2).max(50).optional(),
      phone: Joi.string().trim().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const updates = sanitizeObject(req.body);
    const allowedUpdates = ['name', 'phone'];
    const updateData: any = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    logRequest(req, 'Profile updated', 'info', { userId: user._id });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  })
);

// PUT /api/users/profile/password - Change password
router.put(
  '/profile/password',
  protect,
  validate(
    Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { currentPassword, newPassword } = sanitizeObject(req.body);

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    logRequest(req, 'Password changed', 'info', { userId: user._id });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  })
);

// ============================================
// ADDRESS MANAGEMENT
// ============================================

// GET /api/users/addresses - Get user's saved addresses
router.get(
  '/addresses',
  protect,
  asyncHandler(async (req: any, res) => {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    logRequest(req, 'Addresses retrieved', 'info', { count: addresses.length });

    res.json({
      success: true,
      addresses: addresses.map((addr) => ({
        id: addr._id,
        label: addr.label,
        fullName: addr.fullName,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt,
        updatedAt: addr.updatedAt,
      })),
    });
  })
);

// POST /api/users/addresses - Add new address
router.post(
  '/addresses',
  protect,
  validate(
    Joi.object({
      label: Joi.string().trim().max(50).required(),
      fullName: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      state: Joi.string().trim().optional(),
      postalCode: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
      phone: Joi.string().trim().required(),
      isDefault: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const addressData = sanitizeObject(req.body);

    // Check if this will be the first address (make it default)
    const addressCount = await Address.countDocuments({ user: req.user._id });
    if (addressCount === 0) {
      addressData.isDefault = true;
    }

    const address = new Address({
      ...addressData,
      user: req.user._id,
      country: addressData.country.toUpperCase(),
    });

    await address.save();

    logRequest(req, 'Address created', 'info', { addressId: address._id });

    res.status(201).json({
      success: true,
      address: {
        id: address._id,
        label: address.label,
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
      },
    });
  })
);

// PUT /api/users/addresses/:id - Update address
router.put(
  '/addresses/:id',
  protect,
  validateParams(paramSchemas.id),
  validate(
    Joi.object({
      label: Joi.string().trim().max(50).optional(),
      fullName: Joi.string().trim().optional(),
      address: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      postalCode: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
      phone: Joi.string().trim().optional(),
      isDefault: Joi.boolean().optional(),
    })
  ),
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const updates = sanitizeObject(req.body);

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    if (updates.country) {
      updates.country = updates.country.toUpperCase();
    }

    Object.assign(address, updates);
    await address.save();

    logRequest(req, 'Address updated', 'info', { addressId: address._id });

    res.json({
      success: true,
      address: {
        id: address._id,
        label: address.label,
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
      },
    });
  })
);

// DELETE /api/users/addresses/:id - Delete address
router.delete(
  '/addresses/:id',
  protect,
  validateParams(paramSchemas.id),
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    await Address.findByIdAndDelete(id);

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    logRequest(req, 'Address deleted', 'info', { addressId: id });

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  })
);

// ============================================
// ORDER HISTORY
// ============================================

// GET /api/users/orders - Get user's order history
router.get(
  '/orders',
  protect,
  asyncHandler(async (req: any, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user._id });

    logRequest(req, 'Order history retrieved', 'info', { count: orders.length });

    res.json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice: order.itemsPrice,
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        status: order.status,
        trackingNumber: order.trackingNumber,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    });
  })
);

// POST /api/users/orders/:id/reorder - Reorder from previous order
router.post(
  '/orders/:id/reorder',
  protect,
  validateParams(paramSchemas.id),
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const originalOrder = await Order.findOne({ _id: id, user: req.user._id })
      .populate('items.product');

    if (!originalOrder) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Prepare items for reorder (check if products still exist and are active)
    const reorderItems: any[] = [];
    for (const item of originalOrder.items) {
      const product = (item.product as any);
      if (product && product.status === 'Active') {
        // Find matching variant
        const variant = product.variants?.find(
          (v: any) => v.size === item.size && v.color === item.color
        );
        if (variant && variant.stock > 0) {
          reorderItems.push({
            productId: product._id,
            variantId: variant._id || '',
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: variant.price,
          });
        }
      }
    }

    if (reorderItems.length === 0) {
      throw new AppError('No items available for reorder', 400, 'NO_ITEMS_AVAILABLE');
    }

    logRequest(req, 'Reorder initiated', 'info', {
      originalOrderId: id,
      itemsCount: reorderItems.length,
    });

    res.json({
      success: true,
      message: 'Items ready for reorder',
      items: reorderItems,
      originalOrder: {
        id: originalOrder._id,
        shippingAddress: originalOrder.shippingAddress,
      },
    });
  })
);

// PUT /api/users/:id - Update user
router.put('/:id', protect, admin, validateParams(paramSchemas.id), validate(userSchemas.update), async (req, res) => {
  try {
    // Prevent password updates through this route
    const { password, ...updateData } = sanitizeObject(req.body);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/forgot-password - Request password reset (sends OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        message: 'If an account with that email exists, an OTP has been sent.' 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to user
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    
    // Send OTP email
    const emailSent = await emailService.sendOTP(email, otp, 'password-reset');
    
    if (!emailSent) {
      console.error('Failed to send OTP email');
    }
    
    res.json({ 
      message: 'OTP has been sent to your email.',
      email: user.email,
      // In development, return OTP for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/verify-reset-otp - Verify OTP for password reset
router.post('/verify-reset-otp', validate(userSchemas.verifyResetOTP), async (req, res) => {
  try {
    const { email, otp } = sanitizeObject(req.body);
    
    const user = await User.findOne({ 
      email,
      otp,
      otpExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset', otp },
      process.env.JWT_SECRET || 'zyntherraa_jwt_secret',
      { expiresIn: '1h' }
    );
    
    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    
    // Send password reset email with link
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    await emailService.sendPasswordReset({
      email: user.email,
      name: user.name,
      resetLink,
      expiryHours: 1,
    });
    
    res.json({ 
      message: 'OTP verified successfully. A password reset link has been sent to your email.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/reset-password - Reset password with token (after OTP verification)
router.post('/reset-password', validate(userSchemas.resetPassword), async (req, res) => {
  try {
    const { resetToken, newPassword } = sanitizeObject(req.body);
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'zyntherraa_jwt_secret');
      
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Find user by token
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
