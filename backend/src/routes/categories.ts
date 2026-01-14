import express, { Router } from 'express';
const router: Router = express.Router();
import Category, { ICategory } from '../models/Category';
import { protect, admin } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validation';
import { categorySchemas, paramSchemas } from '../utils/validationSchemas';
import { sanitizeObject } from '../utils/sanitize';
import { invalidateCache } from '../utils/cache';

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    // Optimize query: select only needed fields
    const categories = await Category.find({})
      .select('name productCount status image subcategories createdAt updatedAt')
      .sort({ name: 1 })
      .lean(); // Use lean() for better performance
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
router.post('/', protect, admin, validate(categorySchemas.create), async (req, res) => {
  try {
    const categoryData = sanitizeObject(req.body);
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', protect, admin, validateParams(paramSchemas.id), validate(categorySchemas.update), async (req, res) => {
  try {
    const updateData = sanitizeObject(req.body);
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    
    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ message: 'Subcategory name is required' });
    }
    
    // Clean and validate subcategory data
    const subcategoryData: any = {
      name: req.body.name.trim(),
      status: req.body.status || 'Active',
      productCount: req.body.productCount || 0,
      parentId: category._id // Automatically set parentId to the category's _id
    };
    
    // Validate status enum
    if (!['Active', 'Inactive'].includes(subcategoryData.status)) {
      subcategoryData.status = 'Active';
    }
    
    category.subcategories.push(subcategoryData);
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (error: any) {
    console.error('Error adding subcategory:', error);
    // Return more detailed error message
    const errorMessage = error.errors 
      ? Object.values(error.errors).map((e: any) => e.message).join(', ')
      : error.message || 'Failed to add subcategory';
    res.status(400).json({ message: errorMessage });
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