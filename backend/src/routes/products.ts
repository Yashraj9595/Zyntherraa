import express, { Router } from 'express';
const router: Router = express.Router();
import Product, { IProduct } from '../models/Product';
import { protect, admin } from '../middleware/auth';

// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, status, page = '1', limit = '20' } = req.query as {
      category?: string;
      search?: string;
      status?: string;
      page?: string;
      limit?: string;
    };
    
    let filter: any = {};
    
    if (category) {
      // Convert URL slug format (e.g., "one-piece") to proper format for case-insensitive matching
      // Handle both slug format and direct category name
      const categoryName = category
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Escape special regex characters and use case-insensitive matching
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
    
    const products = await Product.find(filter)
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create a new product
router.post('/', protect, admin, async (req, res) => {
  try {
    // Process variants to ensure proper image/video paths
    const productData = { ...req.body };
    
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((variant: any) => {
        // Ensure images and videos are arrays
        if (variant.images && typeof variant.images === 'string') {
          variant.images = [variant.images];
        }
        
        if (variant.videos && typeof variant.videos === 'string') {
          variant.videos = [variant.videos];
        }
        
        // Ensure images and videos are arrays if they don't exist
        if (!variant.images) variant.images = [];
        if (!variant.videos) variant.videos = [];
        
        return variant;
      });
    }
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', protect, admin, async (req, res) => {
  try {
    // Process variants to ensure proper image/video paths
    const productData = { ...req.body };
    
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((variant: any) => {
        // Ensure images and videos are arrays
        if (variant.images && typeof variant.images === 'string') {
          variant.images = [variant.images];
        }
        
        if (variant.videos && typeof variant.videos === 'string') {
          variant.videos = [variant.videos];
        }
        
        // Ensure images and videos are arrays if they don't exist
        if (!variant.images) variant.images = [];
        if (!variant.videos) variant.videos = [];
        
        return variant;
      });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/products/:id/status - Toggle product status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.status = product.status === 'Active' ? 'Inactive' : 'Active';
    await product.save();
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;