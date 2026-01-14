"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Product_1 = __importDefault(require("../models/Product"));
const SearchHistory_1 = __importDefault(require("../models/SearchHistory"));
const SearchAnalytics_1 = __importDefault(require("../models/SearchAnalytics"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../utils/validationSchemas");
const sanitize_1 = require("../utils/sanitize");
const logger_1 = __importStar(require("../utils/logger"));
const cache_1 = require("../utils/cache");
router.get('/', async (req, res) => {
    try {
        const { category, search, status, page = '1', limit = '20', sortBy = 'newest', minPrice, maxPrice, size, color, brand, } = (0, sanitize_1.sanitizeObject)(req.query);
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
        else {
            filter.status = 'Active';
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { subcategory: { $regex: search, $options: 'i' } },
                { styleNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const variantFilters = [];
        if (minPrice || maxPrice) {
            variantFilters.push({
                price: {
                    ...(minPrice ? { $gte: parseFloat(minPrice) } : {}),
                    ...(maxPrice ? { $lte: parseFloat(maxPrice) } : {}),
                },
            });
        }
        if (size) {
            variantFilters.push({ size: { $regex: new RegExp(`^${size}$`, 'i') } });
        }
        if (color) {
            variantFilters.push({ color: { $regex: new RegExp(`^${color}$`, 'i') } });
        }
        if (brand) {
            filter.$or = [
                ...(filter.$or || []),
                { styleNumber: { $regex: brand, $options: 'i' } },
                { fabric: { $regex: brand, $options: 'i' } },
            ];
        }
        if (variantFilters.length > 0) {
            filter['variants'] = { $elemMatch: { $and: variantFilters } };
        }
        let sort = { createdAt: -1 };
        switch (sortBy) {
            case 'price-low':
                sort = { 'variants.price': 1 };
                break;
            case 'price-high':
                sort = { 'variants.price': -1 };
                break;
            case 'name':
                sort = { title: 1 };
                break;
            case 'name-desc':
                sort = { title: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'newest':
            default:
                sort = { createdAt: -1 };
                break;
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const products = await Product_1.default.find(filter)
            .select('title description category subcategory variants status createdAt updatedAt')
            .limit(limitNum)
            .skip(skip)
            .sort(sort)
            .lean();
        const total = await Product_1.default.countDocuments(filter);
        if (req.user && search && search.trim().length > 0) {
            try {
                const searchHistory = new SearchHistory_1.default({
                    user: req.user._id,
                    query: search.trim(),
                    filters: {
                        ...(category ? { category } : {}),
                        ...(minPrice ? { minPrice: parseFloat(minPrice) } : {}),
                        ...(maxPrice ? { maxPrice: parseFloat(maxPrice) } : {}),
                        ...(size ? { size } : {}),
                        ...(color ? { color } : {}),
                        ...(brand ? { brand } : {}),
                    },
                    resultCount: total,
                });
                await searchHistory.save();
                const analyticsQuery = search.trim().toLowerCase();
                let analytics = await SearchAnalytics_1.default.findOne({ query: analyticsQuery });
                if (analytics) {
                    analytics.count += 1;
                    analytics.avgResultCount = Math.round((analytics.avgResultCount * (analytics.count - 1) + total) / analytics.count);
                    analytics.lastSearched = new Date();
                    await analytics.save();
                }
                else {
                    analytics = new SearchAnalytics_1.default({
                        query: analyticsQuery,
                        count: 1,
                        avgResultCount: total,
                        filters: {
                            ...(category ? { category } : {}),
                            ...(minPrice ? { minPrice: parseFloat(minPrice) } : {}),
                            ...(maxPrice ? { maxPrice: parseFloat(maxPrice) } : {}),
                        },
                        lastSearched: new Date(),
                    });
                    await analytics.save();
                }
            }
            catch (error) {
                logger_1.default.error('Failed to track search', { error: error.message, search });
            }
        }
        (0, logger_1.logRequest)(req, 'Products retrieved', 'info', {
            search,
            category,
            total,
            page: pageNum,
            filters: { minPrice, maxPrice, size, color, brand },
        });
        const response = {
            products,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            totalProducts: total,
            filters: {
                category,
                search,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                size,
                color,
                brand,
            },
            sortBy,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.default.error('Products retrieval error', { error: error.message });
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .select('title description category subcategory variants status styleNumber fabric createdAt updatedAt')
            .lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', auth_1.protect, auth_1.admin, (0, validation_1.validate)(validationSchemas_1.productSchemas.create), async (req, res) => {
    try {
        if (!req.body.title || !req.body.title.trim()) {
            return res.status(400).json({ message: 'Product title is required' });
        }
        if (!req.body.description || !req.body.description.trim()) {
            return res.status(400).json({ message: 'Product description is required' });
        }
        if (!req.body.category || !req.body.category.trim()) {
            return res.status(400).json({ message: 'Product category is required' });
        }
        if (!req.body.variants || !Array.isArray(req.body.variants) || req.body.variants.length === 0) {
            return res.status(400).json({ message: 'At least one product variant is required' });
        }
        const productData = {
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            category: req.body.category.trim(),
            subcategory: req.body.subcategory?.trim() || undefined,
            status: req.body.status || 'Active',
            styleNumber: req.body.styleNumber?.trim() || undefined,
            fabric: req.body.fabric?.trim() || undefined,
            variants: []
        };
        productData.variants = req.body.variants.map((variant) => {
            if (!variant.size || !variant.color) {
                throw new Error('Each variant must have size and color');
            }
            if (typeof variant.price !== 'number' || variant.price < 0) {
                throw new Error('Each variant must have a valid price (number >= 0)');
            }
            if (typeof variant.stock !== 'number' || variant.stock < 0) {
                throw new Error('Each variant must have a valid stock (number >= 0)');
            }
            let images = [];
            if (variant.images) {
                if (Array.isArray(variant.images)) {
                    images = variant.images.filter((img) => img && typeof img === 'string');
                }
                else if (typeof variant.images === 'string') {
                    images = [variant.images];
                }
            }
            let videos = [];
            if (variant.videos) {
                if (Array.isArray(variant.videos)) {
                    videos = variant.videos.filter((vid) => vid && typeof vid === 'string');
                }
                else if (typeof variant.videos === 'string') {
                    videos = [variant.videos];
                }
            }
            return {
                size: variant.size.trim(),
                color: variant.color.trim(),
                images: images,
                videos: videos,
                price: Number(variant.price),
                stock: Number(variant.stock),
                styleNumber: variant.styleNumber?.trim() || undefined,
                fabric: variant.fabric?.trim() || undefined
            };
        });
        const product = new Product_1.default(productData);
        const savedProduct = await product.save();
        await (0, cache_1.invalidateCache)('products:*');
        await (0, cache_1.invalidateCache)('categories:*');
        res.status(201).json(savedProduct);
    }
    catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error.errors
            ? Object.values(error.errors).map((e) => e.message).join(', ')
            : error.message || 'Failed to create product';
        res.status(400).json({ message: errorMessage });
    }
});
router.put('/:id', auth_1.protect, auth_1.admin, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(validationSchemas_1.productSchemas.update), async (req, res) => {
    try {
        const existingProduct = await Product_1.default.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (req.body.title !== undefined && (!req.body.title || !req.body.title.trim())) {
            return res.status(400).json({ message: 'Product title is required' });
        }
        if (req.body.description !== undefined && (!req.body.description || !req.body.description.trim())) {
            return res.status(400).json({ message: 'Product description is required' });
        }
        if (req.body.category !== undefined && (!req.body.category || !req.body.category.trim())) {
            return res.status(400).json({ message: 'Product category is required' });
        }
        if (req.body.variants !== undefined) {
            if (!Array.isArray(req.body.variants) || req.body.variants.length === 0) {
                return res.status(400).json({ message: 'At least one product variant is required' });
            }
        }
        const productData = {};
        if (req.body.title !== undefined)
            productData.title = req.body.title.trim();
        if (req.body.description !== undefined)
            productData.description = req.body.description.trim();
        if (req.body.category !== undefined)
            productData.category = req.body.category.trim();
        if (req.body.subcategory !== undefined)
            productData.subcategory = req.body.subcategory?.trim() || undefined;
        if (req.body.status !== undefined)
            productData.status = req.body.status;
        if (req.body.styleNumber !== undefined)
            productData.styleNumber = req.body.styleNumber?.trim() || undefined;
        if (req.body.fabric !== undefined)
            productData.fabric = req.body.fabric?.trim() || undefined;
        if (req.body.variants && Array.isArray(req.body.variants)) {
            productData.variants = req.body.variants.map((variant) => {
                if (!variant.size || !variant.color) {
                    throw new Error('Each variant must have size and color');
                }
                if (typeof variant.price !== 'number' || variant.price < 0) {
                    throw new Error('Each variant must have a valid price (number >= 0)');
                }
                if (typeof variant.stock !== 'number' || variant.stock < 0) {
                    throw new Error('Each variant must have a valid stock (number >= 0)');
                }
                let images = [];
                if (variant.images) {
                    if (Array.isArray(variant.images)) {
                        images = variant.images.filter((img) => img && typeof img === 'string');
                    }
                    else if (typeof variant.images === 'string') {
                        images = [variant.images];
                    }
                }
                let videos = [];
                if (variant.videos) {
                    if (Array.isArray(variant.videos)) {
                        videos = variant.videos.filter((vid) => vid && typeof vid === 'string');
                    }
                    else if (typeof variant.videos === 'string') {
                        videos = [variant.videos];
                    }
                }
                return {
                    size: variant.size.trim(),
                    color: variant.color.trim(),
                    images: images,
                    videos: videos,
                    price: Number(variant.price),
                    stock: Number(variant.stock),
                    styleNumber: variant.styleNumber?.trim() || undefined,
                    fabric: variant.fabric?.trim() || undefined
                };
            });
        }
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await (0, cache_1.invalidateCache)(`product:${req.params.id}`);
        await (0, cache_1.invalidateCache)('products:*');
        await (0, cache_1.invalidateCache)('categories:*');
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        const errorMessage = error.errors
            ? Object.values(error.errors).map((e) => e.message).join(', ')
            : error.message || 'Failed to update product';
        res.status(400).json({ message: errorMessage });
    }
});
router.delete('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await (0, cache_1.invalidateCache)(`product:${req.params.id}`);
        await (0, cache_1.invalidateCache)('products:*');
        await (0, cache_1.invalidateCache)('categories:*');
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