"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Category_1 = __importDefault(require("../models/Category"));
const auth_1 = require("../middleware/auth");
router.get('/', async (req, res) => {
    try {
        const categories = await Category_1.default.find({}).sort({ name: 1 });
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
router.post('/', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = new Category_1.default(req.body);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id', auth_1.protect, auth_1.admin, async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
        category.subcategories.push(req.body);
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
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