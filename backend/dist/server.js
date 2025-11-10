"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
const upload_1 = __importDefault(require("./routes/upload"));
const status_1 = __importDefault(require("./routes/status"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)(MONGODB_URI);
const corsOrigins = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigins
    ? corsOrigins
        .replace(/^['"]|['"]$/g, '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
console.log('CORS Configuration:');
console.log('  Raw CORS_ORIGIN:', corsOrigins);
console.log('  Parsed origins:', allowedOrigins);
const corsOptions = allowedOrigins.length
    ? {
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins:`, allowedOrigins);
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
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../build')));
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/users', users_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/status', status_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Zyntherraa Backend API is running',
        timestamp: new Date().toISOString()
    });
});
app.use((err, req, res, next) => {
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
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../build/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'ALL'}`);
});
//# sourceMappingURL=server.js.map