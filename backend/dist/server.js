"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const db_1 = require("./config/db");
const security_1 = require("./middleware/security");
const errorHandler_1 = require("./middleware/errorHandler");
const requestId_1 = require("./middleware/requestId");
const logger_1 = __importStar(require("./utils/logger"));
const cache_1 = require("./utils/cache");
dotenv_1.default.config();
(0, errorHandler_1.initializeSentry)();
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const upload_1 = __importDefault(require("./routes/upload"));
const status_1 = __importDefault(require("./routes/status"));
const homepage_1 = __importDefault(require("./routes/homepage"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const tracking_1 = __importDefault(require("./routes/tracking"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const search_1 = __importDefault(require("./routes/search"));
const shipping_1 = __importDefault(require("./routes/shipping"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(requestId_1.requestIdMiddleware);
app.use((req, res, next) => {
    (0, logger_1.logRequest)(req, `${req.method} ${req.path}`, 'info', {
        query: req.query,
        body: req.method !== 'GET' ? '[REDACTED]' : undefined,
    });
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        (0, logger_1.logRequest)(req, `${req.method} ${req.path} ${res.statusCode}`, res.statusCode >= 400 ? 'warn' : 'info', {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });
    next();
});
(0, db_1.connectDB)(MONGODB_URI);
(0, cache_1.initRedis)();
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
            frameSrc: ["'self'", 'https://checkout.razorpay.com'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(security_1.securityHeaders);
if (process.env.NODE_ENV === 'production' && process.env.ENFORCE_HTTPS !== 'false') {
    app.use(security_1.enforceHTTPS);
}
app.use((0, hpp_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
const MAX_REQUEST_SIZE = 50 * 1024 * 1024;
app.use((0, security_1.validateRequestSize)(MAX_REQUEST_SIZE));
const corsOrigins = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigins
    ? corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
const corsOptions = allowedOrigins.length
    ? {
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`[SECURITY] CORS violation: Origin ${origin} not allowed`);
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        optionsSuccessStatus: 200,
    }
    : {
        origin: true,
        credentials: true,
        optionsSuccessStatus: 200,
    };
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
const uploadsPath = path_1.default.join(__dirname, '../uploads');
logger_1.default.info('Serving static files from:', { path: uploadsPath });
app.use('/uploads', express_1.default.static(uploadsPath, {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
    }
}));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../build')));
app.use('/api', security_1.apiLimiter);
app.use('/api/products', security_1.readOnlyLimiter, products_1.default);
app.use('/api/categories', security_1.readOnlyLimiter, categories_1.default);
app.use('/api/users', users_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/payments', security_1.paymentLimiter, payments_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/status', status_1.default);
app.use('/api/homepage', security_1.readOnlyLimiter, homepage_1.default);
app.use('/api/wishlist', security_1.readOnlyLimiter, wishlist_1.default);
app.use('/api/tracking', security_1.readOnlyLimiter, tracking_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/search', security_1.readOnlyLimiter, search_1.default);
app.use('/api/shipping', security_1.readOnlyLimiter, shipping_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Zyntherraa Backend API is running',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
    });
});
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../build/index.html'));
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    logger_1.default.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/api/health`,
        allowedOrigins: allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL',
        sentryEnabled: !!process.env.SENTRY_DSN,
    });
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL'}`);
    if (process.env.SENTRY_DSN) {
        console.log(`🔍 Sentry error tracking: ENABLED`);
    }
});
//# sourceMappingURL=server.js.map