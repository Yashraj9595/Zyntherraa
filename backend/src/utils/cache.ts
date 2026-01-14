import Redis from 'ioredis';
import logger from './logger';

// CACHE DISABLED FOR DEVELOPMENT
// All cache operations are no-ops to prevent stale data issues

// Redis client instance
let redisClient: Redis | null = null;

// Initialize Redis connection - DISABLED
export const initRedis = (): Redis | null => {
  logger.info('Redis cache is DISABLED');
  return null;
};

// Get Redis client - DISABLED
export const getRedisClient = (): Redis | null => {
  return null;
};

// Cache helper functions - ALL DISABLED
export const cache = {
  // Get value from cache - always returns null (cache disabled)
  get: async (key: string): Promise<string | null> => {
    return null;
  },

  // Set value in cache - always returns false (cache disabled)
  set: async (key: string, value: string, ttlSeconds?: number): Promise<boolean> => {
    return false;
  },

  // Delete value from cache - always returns true (cache disabled)
  del: async (key: string): Promise<boolean> => {
    return true;
  },

  // Delete multiple keys matching pattern - always returns true (cache disabled)
  delPattern: async (pattern: string): Promise<boolean> => {
    return true;
  },

  // Check if key exists - always returns false (cache disabled)
  exists: async (key: string): Promise<boolean> => {
    return false;
  },
};

// Cache key generators
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  products: (filters: string) => `products:${filters}`,
  category: (id: string) => `category:${id}`,
  categories: () => 'categories:all',
  homepage: () => 'homepage:data',
  user: (id: string) => `user:${id}`,
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string, page: number) => `user:${userId}:orders:${page}`,
  analytics: (type: string, filters: string) => `analytics:${type}:${filters}`,
};

// Cache middleware factory - DISABLED
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // Cache disabled - just pass through
    next();
  };
};

// Invalidate cache by pattern - DISABLED
export const invalidateCache = async (pattern: string): Promise<void> => {
  // Cache disabled - no-op
  logger.debug(`Cache invalidation skipped (cache disabled): ${pattern}`);
};
