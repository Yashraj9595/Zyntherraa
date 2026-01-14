import express, { Router } from 'express';
const router: Router = express.Router();
import Product, { IProduct } from '../models/Product';
import SearchHistory from '../models/SearchHistory';
import SearchAnalytics from '../models/SearchAnalytics';
import { protect, admin } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { productSchemas, paramSchemas, querySchemas } from '../utils/validationSchemas';
import { sanitizeObject } from '../utils/sanitize';
import logger, { logRequest } from '../utils/logger';
import { invalidateCache } from '../utils/cache';

// GET /api/products - Get all products with optional filtering and advanced features
router.get('/', async (req: any, res) => {
  try {
    const {
      category,
      search,
      status,
      page = '1',
      limit = '20',
      sortBy = 'newest',
      minPrice,
      maxPrice,
      size,
      color,
      brand,
    } = sanitizeObject(req.query) as {
      category?: string;
      search?: string;
      status?: string;
      page?: string;
      limit?: string;
      sortBy?: string;
      minPrice?: string;
      maxPrice?: string;
      size?: string;
      color?: string;
      brand?: string;
    };
    
    let filter: any = {};
    
    // Category filter
    if (category) {
      const categoryName = category
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      const escapedCategory = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    } else {
      // Default to Active if no status specified
      filter.status = 'Active';
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { styleNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Advanced filters
    const variantFilters: any[] = [];
    
    // Price range filter
    if (minPrice || maxPrice) {
      variantFilters.push({
        price: {
          ...(minPrice ? { $gte: parseFloat(minPrice) } : {}),
          ...(maxPrice ? { $lte: parseFloat(maxPrice) } : {}),
        },
      });
    }
    
    // Size filter
    if (size) {
      variantFilters.push({ size: { $regex: new RegExp(`^${size}$`, 'i') } });
    }
    
    // Color filter
    if (color) {
      variantFilters.push({ color: { $regex: new RegExp(`^${color}$`, 'i') } });
    }
    
    // Brand filter (using styleNumber or fabric as brand indicator)
    if (brand) {
      filter.$or = [
        ...(filter.$or || []),
        { styleNumber: { $regex: brand, $options: 'i' } },
        { fabric: { $regex: brand, $options: 'i' } },
      ];
    }
    
    // Apply variant filters if any
    if (variantFilters.length > 0) {
      filter['variants'] = { $elemMatch: { $and: variantFilters } };
    }
    
    // Sorting
    let sort: any = { createdAt: -1 }; // Default: newest first
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
    
    // Optimize query: select only needed fields, populate efficiently
    const products = await Product.find(filter)
      .select('title description category subcategory variants status createdAt updatedAt')
      .limit(limitNum)
      .skip(skip)
      .sort(sort)
      .lean(); // Use lean() for better performance (returns plain JS objects)
      
    // Use countDocuments with same filter for accurate count
    const total = await Product.countDocuments(filter);
    
    // Track search in history and analytics (if user is logged in and search query exists)
    if (req.user && search && search.trim().length > 0) {
      try {
        // Save to search history
        const searchHistory = new SearchHistory({
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
        
        // Update search analytics
        const analyticsQuery = search.trim().toLowerCase();
        let analytics = await SearchAnalytics.findOne({ query: analyticsQuery });
        
        if (analytics) {
          analytics.count += 1;
          analytics.avgResultCount = Math.round(
            (analytics.avgResultCount * (analytics.count - 1) + total) / analytics.count
          );
          analytics.lastSearched = new Date();
          await analytics.save();
        } else {
          analytics = new SearchAnalytics({
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
      } catch (error: any) {
        // Don't fail the request if analytics tracking fails
        logger.error('Failed to track search', { error: error.message, search });
      }
    }
    
    logRequest(req, 'Products retrieved', 'info', {
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
  } catch (error: any) {
    logger.error('Products retrieval error', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    // Optimize query: select only needed fields
    const product = await Product.findById(req.params.id)
      .select('title description category subcategory variants status styleNumber fabric createdAt updatedAt')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create a new product
router.post('/', protect, admin, validate(productSchemas.create), async (req, res) => {
  try {
    // Validate required fields
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
    
    // Process variants to ensure proper image/video paths
    const productData: any = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      subcategory: req.body.subcategory?.trim() || undefined,
      status: req.body.status || 'Active',
      styleNumber: req.body.styleNumber?.trim() || undefined,
      fabric: req.body.fabric?.trim() || undefined,
      variants: []
    };
    
    // Process and validate each variant
    productData.variants = req.body.variants.map((variant: any) => {
      // Validate required variant fields
      if (!variant.size || !variant.color) {
        throw new Error('Each variant must have size and color');
      }
      
      if (typeof variant.price !== 'number' || variant.price < 0) {
        throw new Error('Each variant must have a valid price (number >= 0)');
      }
      
      if (typeof variant.stock !== 'number' || variant.stock < 0) {
        throw new Error('Each variant must have a valid stock (number >= 0)');
      }
      
      // Ensure images and videos are arrays
      let images: string[] = [];
      if (variant.images) {
        if (Array.isArray(variant.images)) {
          images = variant.images.filter((img: any) => img && typeof img === 'string');
        } else if (typeof variant.images === 'string') {
          images = [variant.images];
        }
      }
      
      let videos: string[] = [];
      if (variant.videos) {
        if (Array.isArray(variant.videos)) {
          videos = variant.videos.filter((vid: any) => vid && typeof vid === 'string');
        } else if (typeof variant.videos === 'string') {
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
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    // Invalidate cache
    await invalidateCache('products:*');
    await invalidateCache('categories:*');
    
    res.status(201).json(savedProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    // Return more detailed error message
    const errorMessage = error.errors 
      ? Object.values(error.errors).map((e: any) => e.message).join(', ')
      : error.message || 'Failed to create product';
    res.status(400).json({ message: errorMessage });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', protect, admin, validateParams(paramSchemas.id), validate(productSchemas.update), async (req, res) => {
  try {
    // Check if product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate required fields
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
    
    // Process product data
    const productData: any = {};
    
    // Only update fields that are provided
    if (req.body.title !== undefined) productData.title = req.body.title.trim();
    if (req.body.description !== undefined) productData.description = req.body.description.trim();
    if (req.body.category !== undefined) productData.category = req.body.category.trim();
    if (req.body.subcategory !== undefined) productData.subcategory = req.body.subcategory?.trim() || undefined;
    if (req.body.status !== undefined) productData.status = req.body.status;
    if (req.body.styleNumber !== undefined) productData.styleNumber = req.body.styleNumber?.trim() || undefined;
    if (req.body.fabric !== undefined) productData.fabric = req.body.fabric?.trim() || undefined;
    
    // Process and validate variants if provided
    if (req.body.variants && Array.isArray(req.body.variants)) {
      productData.variants = req.body.variants.map((variant: any) => {
        // Validate required variant fields
        if (!variant.size || !variant.color) {
          throw new Error('Each variant must have size and color');
        }
        
        if (typeof variant.price !== 'number' || variant.price < 0) {
          throw new Error('Each variant must have a valid price (number >= 0)');
        }
        
        if (typeof variant.stock !== 'number' || variant.stock < 0) {
          throw new Error('Each variant must have a valid stock (number >= 0)');
        }
        
        // Ensure images and videos are arrays
        let images: string[] = [];
        if (variant.images) {
          if (Array.isArray(variant.images)) {
            images = variant.images.filter((img: any) => img && typeof img === 'string');
          } else if (typeof variant.images === 'string') {
            images = [variant.images];
          }
        }
        
        let videos: string[] = [];
        if (variant.videos) {
          if (Array.isArray(variant.videos)) {
            videos = variant.videos.filter((vid: any) => vid && typeof vid === 'string');
          } else if (typeof variant.videos === 'string') {
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
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Invalidate cache
    await invalidateCache(`product:${req.params.id}`);
    await invalidateCache('products:*');
    await invalidateCache('categories:*');
    
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    // Return more detailed error message
    const errorMessage = error.errors 
      ? Object.values(error.errors).map((e: any) => e.message).join(', ')
      : error.message || 'Failed to update product';
    res.status(400).json({ message: errorMessage });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Invalidate cache
    await invalidateCache(`product:${req.params.id}`);
    await invalidateCache('products:*');
    await invalidateCache('categories:*');
    
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