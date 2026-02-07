import Redis from 'ioredis';
import logger from './logger';

// Redis client instance
let redisClient: Redis | null = null;

// Initialize Redis connection
export const initRedis = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
      // Don't throw - allow app to continue without cache
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    return null;
  }
};

// Get Redis client
export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

// Cache helper functions
export const cache = {
  // Get value from cache
  get: async (key: string): Promise<string | null> => {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      return value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // Set value in cache
  set: async (key: string, value: string, ttlSeconds?: number): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) return false;

    try {
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  // Delete value from cache
  del: async (key: string): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  // Delete multiple keys matching pattern
  delPattern: async (pattern: string): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
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

// Cache middleware factory
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated admin routes
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      logger.error('Cache middleware error:', error);
    }

    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function (data: any) {
      // Cache the response
      cache.set(cacheKey, JSON.stringify(data), ttlSeconds).catch((err) => {
        logger.error('Failed to cache response:', err);
      });
      
      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

// Invalidate cache by pattern
export const invalidateCache = async (pattern: string): Promise<void> => {
  await cache.delPattern(pattern);
  logger.info(`Cache invalidated for pattern: ${pattern}`);
};

