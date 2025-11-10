"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
router.get('/', async (req, res) => {
    try {
        const { category, search, status, page = '1', limit = '20' } = req.query;
        let filter = {};
        if (category) {
            const categoryName = category
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            const escapedCategory = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
        }
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { subcategory: { $regex: search, $options: 'i' } }
            ];
        }
        const products = await Product_1.default.find(filter)
            .limit(parseInt(limit) * 1)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        const total = await Product_1.default.countDocuments(filter);
        res.json({
            products,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalProducts: total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.variants && Array.isArray(productData.variants)) {
            productData.variants = productData.variants.map((variant) => {
                if (variant.images && typeof variant.images === 'string') {
                    variant.images = [variant.images];
                }
                if (variant.videos && typeof variant.videos === 'string') {
                    variant.videos = [variant.videos];
                }
                if (!variant.images)
                    variant.images = [];
                if (!variant.videos)
                    variant.videos = [];
                return variant;
            });
        }
        const product = new Product_1.default(productData);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.variants && Array.isArray(productData.variants)) {
            productData.variants = productData.variants.map((variant) => {
                if (variant.images && typeof variant.images === 'string') {
                    variant.images = [variant.images];
                }
                if (variant.videos && typeof variant.videos === 'string') {
                    variant.videos = [variant.videos];
                }
                if (!variant.images)
                    variant.images = [];
                if (!variant.videos)
                    variant.videos = [];
                return variant;
            });
        }
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/status', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.status = product.status === 'Active' ? 'Inactive' : 'Active';
        await product.save();
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map