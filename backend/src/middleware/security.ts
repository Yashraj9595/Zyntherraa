import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

// Security logging
export const securityLogger = (req: Request, type: string, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    type,
    requestId: req.requestId,
    ip: req.ip || req.socket.remoteAddress,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?._id?.toString(),
    ...details,
  };
  
  // Use structured logger
  logger.warn(`[SECURITY] ${type}`, logData);
};

// Rate limiting configurations
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      securityLogger(req, 'RATE_LIMIT_EXCEEDED', { limit: max, windowMs });
      res.status(429).json({
        message: message || 'Too many requests from this IP, please try again later.',
      });
    },
  });
};

// General API rate limiter
export const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests per 15 minutes (increased from 100)
  'Too many requests from this IP, please try again later.'
);

// More lenient rate limiter for read-only endpoints (wishlist, products, etc.)
export const readOnlyLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  300, // 300 requests per 15 minutes
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for authentication endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per 15 minutes
  'Too many authentication attempts, please try again later.'
);

// Payment endpoint rate limiter
export const paymentLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests per 15 minutes
  'Too many payment requests, please try again later.'
);

// HTTPS enforcement middleware
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request is secure
  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    return next();
  }

  // Redirect to HTTPS
  securityLogger(req, 'HTTP_REDIRECT', { protocol: req.protocol });
  return res.redirect(301, `https://${req.get('host')}${req.url}`);
};

// Request size validation middleware
export const validateRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      securityLogger(req, 'REQUEST_SIZE_EXCEEDED', { 
        contentLength, 
        maxSize 
      });
      return res.status(413).json({
        message: 'Request entity too large',
      });
    }
    
    next();
  };
};

// Security headers middleware (complement to helmet)
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (handled by helmet, but ensure it's set)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

