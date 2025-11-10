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
const allowedOrigins = corsOrigins
  ? corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const corsOptions: CorsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }
  : {
      origin: true,
      credentials: true,
    };

app.use(cors(corsOptions));
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

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL'}`);
});