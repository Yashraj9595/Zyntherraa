"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Category_1 = __importDefault(require("../models/Category"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../utils/validationSchemas");
const sanitize_1 = require("../utils/sanitize");
router.get('/', async (req, res) => {
    try {
        const categories = await Category_1.default.find({})
            .select('name productCount status image subcategories createdAt updatedAt')
            .sort({ name: 1 })
            .lean();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', auth_1.protect, auth_1.admin, (0, validation_1.validate)(validationSchemas_1.categorySchemas.create), async (req, res) => {
    try {
        const categoryData = (0, sanitize_1.sanitizeObject)(req.body);
        const category = new Category_1.default(categoryData);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id', auth_1.protect, auth_1.admin, (0, validation_1.validateParams)(validationSchemas_1.paramSchemas.id), (0, validation_1.validate)(validationSchemas_1.categorySchemas.update), async (req, res) => {
    try {
        const updateData = (0, sanitize_1.sanitizeObject)(req.body);
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/:id/subcategories', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (!req.body.name || !req.body.name.trim()) {
            return res.status(400).json({ message: 'Subcategory name is required' });
        }
        const subcategoryData = {
            name: req.body.name.trim(),
            status: req.body.status || 'Active',
            productCount: req.body.productCount || 0,
            parentId: category._id
        };
        if (!['Active', 'Inactive'].includes(subcategoryData.status)) {
            subcategoryData.status = 'Active';
        }
        category.subcategories.push(subcategoryData);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    }
    catch (error) {
        console.error('Error adding subcategory:', error);
        const errorMessage = error.errors
            ? Object.values(error.errors).map((e) => e.message).join(', ')
            : error.message || 'Failed to add subcategory';
        res.status(400).json({ message: errorMessage });
    }
});
router.put('/:id/subcategories/:subId', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategoryIndex = category.subcategories.findIndex((sub) => sub._id.toString() === req.params.subId);
        if (subcategoryIndex === -1) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        Object.assign(category.subcategories[subcategoryIndex], req.body);
        await category.save();
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete('/:id/subcategories/:subId', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategoryIndex = category.subcategories.findIndex((sub) => sub._id.toString() === req.params.subId);
        if (subcategoryIndex === -1) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        category.subcategories.splice(subcategoryIndex, 1);
        await category.save();
        res.json({ message: 'Subcategory deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map