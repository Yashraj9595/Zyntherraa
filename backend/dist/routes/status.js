"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = __importDefault(require("os"));
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const package_json_1 = __importDefault(require("../../package.json"));
const router = express_1.default.Router();
const DB_STATE_MAP = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};
const formatDuration = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days)
        parts.push(`${days}d`);
    if (hours)
        parts.push(`${hours}h`);
    if (minutes)
        parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
};
const runModelCheck = async (name, model) => {
    const startedAt = Date.now();
    try {
        await model.findOne().select('_id').lean();
        return {
            name,
            status: 'pass',
            durationMs: Date.now() - startedAt,
        };
    }
    catch (error) {
        return {
            name,
            status: 'fail',
            detail: error?.message || 'Unknown error',
            durationMs: Date.now() - startedAt,
        };
    }
};
const getDatabaseStatus = async () => {
    const startedAt = Date.now();
    const readyState = mongoose_1.default.connection.readyState;
    const stateLabel = DB_STATE_MAP[readyState] || 'unknown';
    if (readyState !== 1) {
        return {
            status: 'fail',
            state: stateLabel,
            detail: 'Database connection is not ready',
            host: mongoose_1.default.connection.host ?? undefined,
            name: mongoose_1.default.connection.name ?? undefined,
            durationMs: Date.now() - startedAt,
        };
    }
    try {
        await mongoose_1.default.connection.db.admin().ping();
        return {
            status: 'pass',
            state: stateLabel,
            host: mongoose_1.default.connection.host ?? undefined,
            name: mongoose_1.default.connection.name ?? undefined,
            durationMs: Date.now() - startedAt,
        };
    }
    catch (error) {
        return {
            status: 'fail',
            state: stateLabel,
            detail: error?.message || 'Failed to ping database',
            host: mongoose_1.default.connection.host ?? undefined,
            name: mongoose_1.default.connection.name ?? undefined,
            durationMs: Date.now() - startedAt,
        };
    }
};
router.get('/', async (_req, res) => {
    const startedAt = Date.now();
    const dbStatus = await getDatabaseStatus();
    const modelChecks = await Promise.all([
        runModelCheck('products', Product_1.default),
        runModelCheck('categories', Category_1.default),
        runModelCheck('orders', Order_1.default),
        runModelCheck('users', User_1.default),
    ]);
    const allChecks = [dbStatus, ...modelChecks];
    const hasFailure = allChecks.some((check) => check.status === 'fail');
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();
    const metrics = {
        uptime: {
            seconds: uptimeSeconds,
            humanReadable: formatDuration(uptimeSeconds),
        },
        memory: {
            rssMb: Number((memoryUsage.rss / 1024 / 1024).toFixed(2)),
            heapUsedMb: Number((memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
            heapTotalMb: Number((memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
            externalMb: Number((memoryUsage.external / 1024 / 1024).toFixed(2)),
        },
        cpuLoad: os_1.default.loadavg(),
        responseTimeMs: Date.now() - startedAt,
    };
    const endpoints = [
        { method: 'GET', path: '/api/health', description: 'Basic health check' },
        { method: 'GET', path: '/api/status', description: 'Comprehensive service status' },
        { method: 'GET', path: '/api/products', description: 'List products' },
        { method: 'GET', path: '/api/categories', description: 'List categories' },
        { method: 'GET', path: '/api/users', description: 'List users (requires admin auth)' },
        { method: 'GET', path: '/api/orders', description: 'List orders (requires auth)' },
        { method: 'POST', path: '/api/users/login', description: 'User login' },
        { method: 'POST', path: '/api/users/register', description: 'User registration' },
    ];
    const statusPayload = {
        status: hasFailure ? 'degraded' : 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: package_json_1.default.version || '1.0.0',
        checks: {
            database: dbStatus,
            services: modelChecks,
        },
        metrics,
        endpoints,
    };
    res.status(hasFailure ? 503 : 200).json(statusPayload);
});
exports.default = router;
//# sourceMappingURL=status.js.map