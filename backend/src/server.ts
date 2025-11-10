import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

// Use MongoDB connection string from environment or default to localhost
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';

// Import routes
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import statusRoutes from './routes/status';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(MONGODB_URI);

// Configure CORS
const corsOrigins = process.env.CORS_ORIGIN;
// Remove quotes if present and split by comma
const allowedOrigins = corsOrigins
  ? corsOrigins
      .replace(/^['"]|['"]$/g, '') // Remove surrounding quotes
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

console.log('CORS Configuration:');
console.log('  Raw CORS_ORIGIN:', corsOrigins);
console.log('  Parsed origins:', allowedOrigins);

const corsOptions: CorsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Log CORS rejection for debugging
        console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins:`, allowedOrigins);
        
        // Return error for CORS rejection
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
    }
  : {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../../build')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Zyntherraa Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be after all API routes but before catch-all)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS')) {
    console.error('CORS Error:', err.message);
    return res.status(403).json({ 
      message: 'CORS policy violation',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Origin not allowed'
    });
  }

  console.error('Server Error:', err.stack || err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Catch-all handler for React routing (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL'}`);
});