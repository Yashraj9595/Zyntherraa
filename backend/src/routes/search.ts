import express, { Router } from 'express';
const router: Router = express.Router();
import Product from '../models/Product';
import SearchHistory from '../models/SearchHistory';
import SearchAnalytics from '../models/SearchAnalytics';
import { protect } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { sanitizeObject } from '../utils/sanitize';
import logger, { logRequest } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import Joi from 'joi';

// Validation schemas
const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  limit: Joi.number().integer().min(1).max(10).default(5),
});

// GET /api/search/autocomplete - Get search suggestions
router.get(
  '/autocomplete',
  validateQuery(searchQuerySchema),
  asyncHandler(async (req: any, res) => {
    const { q, limit = 5 } = sanitizeObject(req.query);
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = q.trim();
    const limitNum = parseInt(limit as string) || 5;

    // Get product title suggestions
    const products = await Product.find({
      status: 'Active',
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .select('title category subcategory')
      .limit(limitNum * 2); // Get more to filter unique

    // Get popular search terms from analytics
    const popularSearches = await SearchAnalytics.find({
      query: { $regex: searchTerm, $options: 'i' },
    })
      .sort({ count: -1 })
      .limit(limitNum)
      .select('query count');

    // Combine and deduplicate suggestions
    const suggestions: string[] = [];
    const seen = new Set<string>();

    // Add product titles
    products.forEach((product) => {
      if (product.title && !seen.has(product.title.toLowerCase())) {
        suggestions.push(product.title);
        seen.add(product.title.toLowerCase());
      }
      if (product.category && !seen.has(product.category.toLowerCase())) {
        suggestions.push(product.category);
        seen.add(product.category.toLowerCase());
      }
    });

    // Add popular search terms
    popularSearches.forEach((search) => {
      if (!seen.has(search.query.toLowerCase())) {
        suggestions.push(search.query);
        seen.add(search.query.toLowerCase());
      }
    });

    // Limit results
    const limitedSuggestions = suggestions.slice(0, limitNum);

    logRequest(req, 'Search autocomplete', 'info', { query: searchTerm, count: limitedSuggestions.length });

    res.json({
      success: true,
      suggestions: limitedSuggestions,
    });
  })
);

// GET /api/search/history - Get user's search history
router.get(
  '/history',
  protect,
  asyncHandler(async (req: any, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('query filters resultCount clicked createdAt');

    logRequest(req, 'Search history retrieved', 'info', { count: history.length });

    res.json({
      success: true,
      history: history.map((item) => ({
        id: item._id,
        query: item.query,
        filters: item.filters,
        resultCount: item.resultCount,
        clicked: item.clicked,
        createdAt: item.createdAt,
      })),
    });
  })
);

// DELETE /api/search/history/:id - Delete a search history item
router.delete(
  '/history/:id',
  protect,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    
    const historyItem = await SearchHistory.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!historyItem) {
      throw new AppError('Search history item not found', 404, 'NOT_FOUND');
    }

    await SearchHistory.findByIdAndDelete(id);

    logRequest(req, 'Search history item deleted', 'info', { id });

    res.json({
      success: true,
      message: 'Search history item deleted',
    });
  })
);

// DELETE /api/search/history - Clear all search history
router.delete(
  '/history',
  protect,
  asyncHandler(async (req: any, res) => {
    await SearchHistory.deleteMany({ user: req.user._id });

    logRequest(req, 'Search history cleared', 'info');

    res.json({
      success: true,
      message: 'Search history cleared',
    });
  })
);

// GET /api/search/analytics - Get search analytics (admin only)
router.get(
  '/analytics',
  protect,
  async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { limit = 50, sortBy = 'count' } = req.query;

      let sort: any = { count: -1 };
      if (sortBy === 'recent') {
        sort = { lastSearched: -1 };
      } else if (sortBy === 'ctr') {
        sort = { clickThroughRate: -1 };
      }

      const analytics = await SearchAnalytics.find({})
        .sort(sort)
        .limit(parseInt(limit as string))
        .select('query count avgResultCount clickThroughRate lastSearched');

      // Get total searches
      const totalSearches = await SearchAnalytics.aggregate([
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]);

      // Get unique search terms count
      const uniqueTerms = await SearchAnalytics.countDocuments({});

      // Get top categories from searches
      const topCategories = await SearchAnalytics.aggregate([
        { $match: { 'filters.category': { $exists: true } } },
        { $group: { _id: '$filters.category', count: { $sum: '$count' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      logRequest(req, 'Search analytics retrieved', 'info', { count: analytics.length });

      res.json({
        success: true,
        analytics: analytics.map((item) => ({
          query: item.query,
          count: item.count,
          avgResultCount: item.avgResultCount,
          clickThroughRate: item.clickThroughRate,
          lastSearched: item.lastSearched,
        })),
        summary: {
          totalSearches: totalSearches[0]?.total || 0,
          uniqueTerms,
          topCategories: topCategories.map((cat) => ({
            category: cat._id,
            count: cat.count,
          })),
        },
      });
    } catch (error: any) {
      logger.error('Search analytics error', { error: error.message });
      res.status(500).json({ message: error.message || 'Failed to fetch search analytics' });
    }
  }
);

export default router;

