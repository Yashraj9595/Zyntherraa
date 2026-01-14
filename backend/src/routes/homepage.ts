import express, { Router } from 'express';
const router: Router = express.Router();
import { Banner, FeaturedProduct, HomePageSection, WatchAndShop, IBanner, IFeaturedProduct } from '../models/HomePage';
import Product from '../models/Product';
import { protect, admin } from '../middleware/auth';

// ==================== BANNERS ====================

// GET /api/homepage/banners - Get all banners (public, but only active ones)
router.get('/banners', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter: any = {};
    
    // If not admin, only show active banners
    if (activeOnly === 'true' || !req.headers.authorization) {
      filter.isActive = true;
    }
    
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/homepage/banners/:id - Get single banner
router.get('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/homepage/banners - Create banner (admin only)
router.post('/banners', protect, admin, async (req, res) => {
  try {
    const { title, subtitle, image, mobileImage, buttonText, buttonLink, order, isActive } = req.body;
    
    if (!title || !image) {
      return res.status(400).json({ message: 'Title and image are required' });
    }
    
    const banner = new Banner({
      title,
      subtitle,
      image,
      mobileImage,
      buttonText,
      buttonLink,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await banner.save();
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/homepage/banners/:id - Update banner (admin only)
router.put('/banners/:id', protect, admin, async (req, res) => {
  try {
    const { title, subtitle, image, mobileImage, buttonText, buttonLink, order, isActive } = req.body;
    
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (image !== undefined) banner.image = image;
    if (mobileImage !== undefined) banner.mobileImage = mobileImage;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (order !== undefined) banner.order = order;
    if (isActive !== undefined) banner.isActive = isActive;
    
    await banner.save();
    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/homepage/banners/:id - Delete banner (admin only)
router.delete('/banners/:id', protect, admin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== FEATURED PRODUCTS ====================

// GET /api/homepage/featured - Get all featured products with product details
router.get('/featured', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter: any = {};
    
    if (activeOnly === 'true' || !req.headers.authorization) {
      filter.isActive = true;
    }
    
    const featuredProducts = await FeaturedProduct.find(filter)
      .populate('productId')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(featuredProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/homepage/featured/:id - Get single featured product
router.get('/featured/:id', async (req, res) => {
  try {
    const featured = await FeaturedProduct.findById(req.params.id).populate('productId');
    if (!featured) {
      return res.status(404).json({ message: 'Featured product not found' });
    }
    res.json(featured);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/homepage/featured - Create featured product (admin only)
router.post('/featured', protect, admin, async (req, res) => {
  try {
    const { productId, order, isActive } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if already featured
    const existing = await FeaturedProduct.findOne({ productId });
    if (existing) {
      return res.status(400).json({ message: 'Product is already featured' });
    }
    
    const featured = new FeaturedProduct({
      productId,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await featured.save();
    const populated = await FeaturedProduct.findById(featured._id).populate('productId');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/homepage/featured/:id - Update featured product (admin only)
router.put('/featured/:id', protect, admin, async (req, res) => {
  try {
    const { productId, order, isActive } = req.body;
    
    const featured = await FeaturedProduct.findById(req.params.id);
    if (!featured) {
      return res.status(404).json({ message: 'Featured product not found' });
    }
    
    // If productId is being changed, verify new product exists
    if (productId && productId !== featured.productId.toString()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if new product is already featured
      const existing = await FeaturedProduct.findOne({ 
        productId, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Product is already featured' });
      }
      
      featured.productId = productId;
    }
    
    if (order !== undefined) featured.order = order;
    if (isActive !== undefined) featured.isActive = isActive;
    
    await featured.save();
    const populated = await FeaturedProduct.findById(featured._id).populate('productId');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/homepage/featured/:id - Delete featured product (admin only)
router.delete('/featured/:id', protect, admin, async (req, res) => {
  try {
    const featured = await FeaturedProduct.findByIdAndDelete(req.params.id);
    if (!featured) {
      return res.status(404).json({ message: 'Featured product not found' });
    }
    res.json({ message: 'Featured product removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== HOME PAGE SECTIONS ====================

// GET /api/homepage/sections - Get all sections
router.get('/sections', async (req, res) => {
  try {
    const { activeOnly, type } = req.query;
    const filter: any = {};
    
    if (activeOnly === 'true' || !req.headers.authorization) {
      filter.isActive = true;
    }
    
    if (type) {
      filter.type = type;
    }
    
    const sections = await HomePageSection.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(sections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/homepage/sections - Create section (admin only)
router.post('/sections', protect, admin, async (req, res) => {
  try {
    const { type, title, subtitle, order, isActive, config } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Section type is required' });
    }
    
    const section = new HomePageSection({
      type,
      title,
      subtitle,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      config: config || {}
    });
    
    await section.save();
    res.status(201).json(section);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/homepage/sections/:id - Update section (admin only)
router.put('/sections/:id', protect, admin, async (req, res) => {
  try {
    const section = await HomePageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    const { type, title, subtitle, order, isActive, config } = req.body;
    
    if (type !== undefined) section.type = type;
    if (title !== undefined) section.title = title;
    if (subtitle !== undefined) section.subtitle = subtitle;
    if (order !== undefined) section.order = order;
    if (isActive !== undefined) section.isActive = isActive;
    if (config !== undefined) section.config = config;
    
    await section.save();
    res.json(section);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/homepage/sections/:id - Delete section (admin only)
router.delete('/sections/:id', protect, admin, async (req, res) => {
  try {
    const section = await HomePageSection.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json({ message: 'Section deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== WATCH & SHOP ====================

// GET /api/homepage/watch-and-shop - Get all watch & shop items
router.get('/watch-and-shop', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter: any = {};
    
    if (activeOnly === 'true' || !req.headers.authorization) {
      filter.isActive = true;
    }
    
    const items = await WatchAndShop.find(filter)
      .populate('productId')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/homepage/watch-and-shop/:id - Get single watch & shop item
router.get('/watch-and-shop/:id', async (req, res) => {
  try {
    const item = await WatchAndShop.findById(req.params.id).populate('productId');
    if (!item) {
      return res.status(404).json({ message: 'Watch & Shop item not found' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/homepage/watch-and-shop - Create watch & shop item (admin only)
router.post('/watch-and-shop', protect, admin, async (req, res) => {
  try {
    const { title, description, videoUrl, imageUrl, productId, productImage, productPrice, order, isActive } = req.body;
    
    if (!title || !productId) {
      return res.status(400).json({ message: 'Title and product ID are required' });
    }
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get product price if not provided
    let finalProductPrice = productPrice;
    if (!finalProductPrice && product.variants && product.variants.length > 0) {
      finalProductPrice = Math.min(...product.variants.map((v: any) => v.price || 0));
    }
    
    // Get product image if not provided
    let finalProductImage = productImage;
    if (!finalProductImage && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.images && firstVariant.images.length > 0) {
        finalProductImage = firstVariant.images[0];
      }
    }
    
    const item = new WatchAndShop({
      title,
      description,
      videoUrl,
      imageUrl,
      productId,
      productImage: finalProductImage,
      productPrice: finalProductPrice,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await item.save();
    const populated = await WatchAndShop.findById(item._id).populate('productId');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/homepage/watch-and-shop/:id - Update watch & shop item (admin only)
router.put('/watch-and-shop/:id', protect, admin, async (req, res) => {
  try {
    const item = await WatchAndShop.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Watch & Shop item not found' });
    }
    
    const { title, description, videoUrl, imageUrl, productId, productImage, productPrice, order, isActive } = req.body;
    
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (videoUrl !== undefined) item.videoUrl = videoUrl;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (productImage !== undefined) item.productImage = productImage;
    if (productPrice !== undefined) item.productPrice = productPrice;
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;
    
    // If productId is being changed, verify new product exists
    if (productId && productId !== item.productId.toString()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      item.productId = productId;
      
      // Update product price and image if not explicitly provided
      if (!productPrice && product.variants && product.variants.length > 0) {
        item.productPrice = Math.min(...product.variants.map((v: any) => v.price || 0));
      }
      if (!productImage && product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        if (firstVariant.images && firstVariant.images.length > 0) {
          item.productImage = firstVariant.images[0];
        }
      }
    }
    
    await item.save();
    const populated = await WatchAndShop.findById(item._id).populate('productId');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/homepage/watch-and-shop/:id - Delete watch & shop item (admin only)
router.delete('/watch-and-shop/:id', protect, admin, async (req, res) => {
  try {
    const item = await WatchAndShop.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Watch & Shop item not found' });
    }
    res.json({ message: 'Watch & Shop item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

