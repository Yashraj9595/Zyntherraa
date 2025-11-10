import express, { Router } from 'express';
const router: Router = express.Router();
import Category, { ICategory } from '../models/Category';
import { protect, admin } from '../middleware/auth';

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/:id - Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories - Create a new category
router.post('/', protect, admin, async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories/:id/subcategories - Add a subcategory
router.post('/:id/subcategories', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.subcategories.push(req.body);
    await category.save();
    
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/categories/:id/subcategories/:subId - Update a subcategory
router.put('/:id/subcategories/:subId', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const subcategoryIndex = category.subcategories.findIndex((sub: any) => sub._id.toString() === req.params.subId);
    
    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    Object.assign(category.subcategories[subcategoryIndex], req.body);
    await category.save();
    
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/categories/:id/subcategories/:subId - Delete a subcategory
router.delete('/:id/subcategories/:subId', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const subcategoryIndex = category.subcategories.findIndex((sub: any) => sub._id.toString() === req.params.subId);
    
    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();
    
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;