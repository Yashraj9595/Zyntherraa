import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { connectDB } from './config/db';
import {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  readOnlyLimiter,
  enforceHTTPS,
  securityHeaders,
  validateRequestSize,
  securityLogger,
} from './middleware/security';
import { initializeSentry, errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import logger, { logRequest } from './utils/logger';
import { initRedis } from './utils/cache';

// Load environment variables
dotenv.config();

// Initialize Sentry error tracking (must be done before other imports)
initializeSentry();

// Use MongoDB connection string from environment or default to localhost
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';

// Import routes
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import analyticsRoutes from './routes/analytics';
import uploadRoutes from './routes/upload';
import statusRoutes from './routes/status';
import homepageRoutes from './routes/homepage';
import wishlistRoutes from './routes/wishlist';
import trackingRoutes from './routes/tracking';
import inventoryRoutes from './routes/inventory';
import searchRoutes from './routes/search';
import shippingRoutes from './routes/shipping';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// REQUEST ID MIDDLEWARE (must be first)
// ============================================
app.use(requestIdMiddleware);

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log request
  logRequest(req, `${req.method} ${req.path}`, 'info', {
    query: req.query,
    body: req.method !== 'GET' ? '[REDACTED]' : undefined, // Don't log request bodies (may contain sensitive data)
  });

  // Log response when finished
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req, `${req.method} ${req.path} ${res.statusCode}`, 
      res.statusCode >= 400 ? 'warn' : 'info', 
      {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      }
    );
  });

  next();
});

// Connect to MongoDB
connectDB(MONGODB_URI);

// Initialize Redis cache (optional - app continues if Redis unavailable)
initRedis();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Trust proxy (for HTTPS detection behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Helmet.js - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'], // Allow images from any source (for product images)
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'], // Razorpay checkout
        connectSrc: ["'self'", 'https://api.razorpay.com'],
        frameSrc: ["'self'", 'https://checkout.razorpay.com'],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding (for images, etc.)
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
  })
);

// Additional security headers
app.use(securityHeaders);

// HTTPS enforcement (production only)
if (process.env.NODE_ENV === 'production' && process.env.ENFORCE_HTTPS !== 'false') {
  app.use(enforceHTTPS);
}

// Prevent HTTP Parameter Pollution
app.use(hpp());

// MongoDB injection prevention
app.use(mongoSanitize());

// Request size limits
const MAX_REQUEST_SIZE = 50 * 1024 * 1024; // 50MB
app.use(validateRequestSize(MAX_REQUEST_SIZE));

// Configure CORS
const isProduction = process.env.NODE_ENV === 'production';
const defaultProductionOrigins = ['https://zyntherraa.com', 'https://www.zyntherraa.com'];
const corsOrigins = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigins
  ? corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : isProduction
    ? defaultProductionOrigins
    : [];

const corsOptions: CorsOptions = allowedOrigins.length
  ? {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Log security event
        console.warn(`[SECURITY] CORS violation: Origin ${origin} not allowed`);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    }
  : {
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
    };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Webhook endpoint needs raw body for signature verification
// Must be registered before JSON middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
logger.info('Serving static files from:', { path: uploadsPath });
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../../build')));

// Rate limiting - Apply general API limiter to all routes
app.use('/api', apiLimiter);

// API Routes with specific rate limiters
app.use('/api/products', readOnlyLimiter, productRoutes); // More lenient for read operations
app.use('/api/categories', readOnlyLimiter, categoryRoutes); // More lenient for read operations
app.use('/api/users', userRoutes); // Rate limiting removed as requested
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes); // Stricter rate limit for payments
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/homepage', readOnlyLimiter, homepageRoutes); // More lenient for read operations
app.use('/api/wishlist', readOnlyLimiter, wishlistRoutes); // More lenient for wishlist operations
app.use('/api/tracking', readOnlyLimiter, trackingRoutes); // More lenient for read operations
app.use('/api/inventory', inventoryRoutes);
app.use('/api/search', readOnlyLimiter, searchRoutes);
app.use('/api/shipping', readOnlyLimiter, shippingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Zyntherraa Backend API is running',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    healthCheck: `http://localhost:${PORT}/api/health`,
    allowedOrigins: allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL',
    sentryEnabled: !!process.env.SENTRY_DSN,
  });
  
  // Also log to console for visibility
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL'}`);
  if (process.env.SENTRY_DSN) {
    console.log(`🔍 Sentry error tracking: ENABLED`);
  }
});