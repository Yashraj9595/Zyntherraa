"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const User_1 = __importDefault(require("../models/User"));
const Address_1 = __importDefault(require("../models/Address"));
const Order_1 = __importDefault(require("../models/Order"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const emailService_1 = __importDefault(require("../utils/emailService"));
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../utils/validationSchemas");
const sanitize_1 = require("../utils/sanitize");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const joi_1 = __importDefault(require("joi"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'zyntherraa_jwt_secret', {
        expiresIn: '30d',
    });
};
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
router.get('/', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/register', (0, validation_1.validate)(validationSchemas_1.userSchemas.register), async (req, res) => {
    try {
        const { name, email, password, phone } = (0, sanitize_1.sanitizeObject)(req.body);
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        const user = new User_1.default({
            name,
            email,
            password: hashedPassword,
            phone: phone || undefined,
            isVerified: false,
            otp,
            otpExpire
        });
        const savedUser = await user.save();
        const emailSent = await emailService_1.default.sendOTP(email, otp, 'registration');
        if (!emailSent) {
            console.error('Failed to send OTP email');
        }
        res.status(201).json({
            message: 'Registration successful. Please verify your email with the OTP sent to your email.',
            userId: savedUser._id,
            email: savedUser.email,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/verify-otp', (0, validation_1.validate)(validationSchemas_1.userSchemas.verifyOTP), async (req, res) => {
    try {
        const { email, otp } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        await emailService_1.default.sendWelcomeEmail({
            email: user.email,
            name: user.name,
        });
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/resend-otp', (0, validation_1.validate)(validationSchemas_1.userSchemas.resendOTP), async (req, res) => {
    try {
        const { email, purpose } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.json({
                message: 'If an account with that email exists, an OTP has been sent.'
            });
        }
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
        const emailSent = await emailService_1.default.sendOTP(email, otp, (purpose || 'registration'));
        if (!emailSent) {
            console.error('Failed to send OTP email');
        }
        res.json({
            message: 'OTP has been sent to your email.',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/login', (0, validation_1.validate)(validationSchemas_1.userSchemas.login), async (req, res) => {
    try {
        const { email, password } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
            user.otp = otp;
            user.otpExpire = otpExpire;
            await user.save();
            await emailService_1.default.sendOTP(email, otp, 'registration');
            return res.status(200).json({
                message: 'Please verify your email with the OTP sent to your email.',
                requiresVerification: true,
                email: user.email,
                otp: process.env.NODE_ENV === 'development' ? otp : undefined
            });
        }
        if (!user.isVerified && user.role === 'admin') {
            user.isVerified = true;
            await user.save();
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/verify-login-otp', (0, validation_1.validate)(validationSchemas_1.userSchemas.verifyLoginOTP), async (req, res) => {
    try {
        const { email, otp } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        const token = generateToken(user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/profile', auth_1.protect, async (req, res) => {
    try {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/profile', auth_1.protect, (0, validation_1.validate)(joi_1.default.object({
    name: joi_1.default.string().trim().min(2).max(50).optional(),
    phone: joi_1.default.string().trim().optional(),
})), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const updates = (0, sanitize_1.sanitizeObject)(req.body);
    const allowedUpdates = ['name', 'phone'];
    const updateData = {};
    Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            updateData[key] = updates[key];
        }
    });
    const user = await User_1.default.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    (0, logger_1.logRequest)(req, 'Profile updated', 'info', { userId: user._id });
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
}));
router.put('/profile/password', auth_1.protect, (0, validation_1.validate)(joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required(),
})), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = (0, sanitize_1.sanitizeObject)(req.body);
    const user = await User_1.default.findById(req.user._id).select('+password');
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new errorHandler_1.AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    user.password = await bcryptjs_1.default.hash(newPassword, salt);
    await user.save();
    (0, logger_1.logRequest)(req, 'Password changed', 'info', { userId: user._id });
    res.json({
        success: true,
        message: 'Password updated successfully',
    });
}));
router.get('/addresses', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const addresses = await Address_1.default.find({ user: req.user._id }).sort({
        isDefault: -1,
        createdAt: -1,
    });
    (0, logger_1.logRequest)(req, 'Addresses retrieved', 'info', { count: addresses.length });
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
}));
router.post('/addresses', auth_1.protect, (0, validation_1.validate)(joi_1.default.object({
    label: joi_1.default.string().trim().max(50).required(),
    fullName: joi_1.default.string().trim().required(),
    address: joi_1.default.string().trim().required(),
    city: joi_1.default.string().trim().required(),
    state: joi_1.default.string().trim().optional(),
    postalCode: joi_1.default.string().trim().required(),
    country: joi_1.default.string().trim().required(),
    phone: joi_1.default.string().trim().required(),
    isDefault: joi_1.default.boolean().optional(),
})), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const addressData = (0, sanitize_1.sanitizeObject)(req.body);
    const addressCount = await Address_1.default.countDocuments({ user: req.user._id });
    if (addressCount === 0) {
        addressData.isDefault = true;
    }
    const address = new Address_1.default({
        ...addressData,
        user: req.user._id,
        country: addressData.country.toUpperCase(),
    });
    await address.save();
    (0, logger_1.logRequest)(req, 'Address created', 'info', { addressId: address._id });
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
}));
router.put('/addresses/:id', auth_1.protect, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(joi_1.default.object({
    label: joi_1.default.string().trim().max(50).optional(),
    fullName: joi_1.default.string().trim().optional(),
    address: joi_1.default.string().trim().optional(),
    city: joi_1.default.string().trim().optional(),
    state: joi_1.default.string().trim().optional(),
    postalCode: joi_1.default.string().trim().optional(),
    country: joi_1.default.string().trim().optional(),
    phone: joi_1.default.string().trim().optional(),
    isDefault: joi_1.default.boolean().optional(),
})), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updates = (0, sanitize_1.sanitizeObject)(req.body);
    const address = await Address_1.default.findOne({ _id: id, user: req.user._id });
    if (!address) {
        throw new errorHandler_1.AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }
    if (updates.country) {
        updates.country = updates.country.toUpperCase();
    }
    Object.assign(address, updates);
    await address.save();
    (0, logger_1.logRequest)(req, 'Address updated', 'info', { addressId: address._id });
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
}));
router.delete('/addresses/:id', auth_1.protect, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const address = await Address_1.default.findOne({ _id: id, user: req.user._id });
    if (!address) {
        throw new errorHandler_1.AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }
    await Address_1.default.findByIdAndDelete(id);
    if (address.isDefault) {
        const nextAddress = await Address_1.default.findOne({ user: req.user._id });
        if (nextAddress) {
            nextAddress.isDefault = true;
            await nextAddress.save();
        }
    }
    (0, logger_1.logRequest)(req, 'Address deleted', 'info', { addressId: id });
    res.json({
        success: true,
        message: 'Address deleted successfully',
    });
}));
router.get('/orders', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const orders = await Order_1.default.find({ user: req.user._id })
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const total = await Order_1.default.countDocuments({ user: req.user._id });
    (0, logger_1.logRequest)(req, 'Order history retrieved', 'info', { count: orders.length });
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
}));
router.post('/orders/:id/reorder', auth_1.protect, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const originalOrder = await Order_1.default.findOne({ _id: id, user: req.user._id })
        .populate('items.product');
    if (!originalOrder) {
        throw new errorHandler_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    const reorderItems = [];
    for (const item of originalOrder.items) {
        const product = item.product;
        if (product && product.status === 'Active') {
            const variant = product.variants?.find((v) => v.size === item.size && v.color === item.color);
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
        throw new errorHandler_1.AppError('No items available for reorder', 400, 'NO_ITEMS_AVAILABLE');
    }
    (0, logger_1.logRequest)(req, 'Reorder initiated', 'info', {
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
}));
router.put('/:id', auth_1.protect, auth_1.admin, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(validationSchemas_1.userSchemas.update), async (req, res) => {
    try {
        const { password, ...updateData } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.json({
                message: 'If an account with that email exists, an OTP has been sent.'
            });
        }
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
        const emailSent = await emailService_1.default.sendOTP(email, otp, 'password-reset');
        if (!emailSent) {
            console.error('Failed to send OTP email');
        }
        res.json({
            message: 'OTP has been sent to your email.',
            email: user.email,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/verify-reset-otp', (0, validation_1.validate)(validationSchemas_1.userSchemas.verifyResetOTP), async (req, res) => {
    try {
        const { email, otp } = (0, sanitize_1.sanitizeObject)(req.body);
        const user = await User_1.default.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id, type: 'password-reset', otp }, process.env.JWT_SECRET || 'zyntherraa_jwt_secret', { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 3600000);
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
        await emailService_1.default.sendPasswordReset({
            email: user.email,
            name: user.name,
            resetLink,
            expiryHours: 1,
        });
        res.json({
            message: 'OTP verified successfully. A password reset link has been sent to your email.',
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/reset-password', (0, validation_1.validate)(validationSchemas_1.userSchemas.resetPassword), async (req, res) => {
    try {
        const { resetToken, newPassword } = (0, sanitize_1.sanitizeObject)(req.body);
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_SECRET || 'zyntherraa_jwt_secret');
            if (decoded.type !== 'password-reset') {
                return res.status(400).json({ message: 'Invalid reset token' });
            }
        }
        catch (error) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const user = await User_1.default.findOne({
            _id: decoded.id,
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map