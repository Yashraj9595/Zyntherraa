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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zyntherraa';
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
const upload_1 = __importDefault(require("./routes/upload"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)(MONGODB_URI);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../build')));
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/users', users_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/upload', upload_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Zyntherraa Backend API is running',
        timestamp: new Date().toISOString()
    });
});
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../build/index.html'));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=server.js.map