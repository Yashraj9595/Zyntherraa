"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DEFAULT_DB_NAME = 'zyntherraa';
const ensureDatabaseName = (uri, dbName) => {
    const dbNamePattern = /^((?:mongodb\+srv|mongodb):\/\/[^/]+)\/([^/?]+)(\?.*)?$/;
    const match = uri.match(dbNamePattern);
    if (match) {
        const protocolAndHost = match[1];
        const queryParams = match[3] || '';
        return `${protocolAndHost}/${dbName}${queryParams}`;
    }
    const noDbPattern = /^((?:mongodb\+srv|mongodb):\/\/[^/?]+)(\/?)(\?.*)?$/;
    const noDbMatch = uri.match(noDbPattern);
    if (noDbMatch) {
        const protocolAndHost = noDbMatch[1];
        const queryParams = noDbMatch[3] || '';
        return `${protocolAndHost}/${dbName}${queryParams}`;
    }
    if (uri.endsWith('/')) {
        const queryIndex = uri.indexOf('?');
        if (queryIndex > 0) {
            return `${uri.substring(0, queryIndex)}${dbName}${uri.substring(queryIndex)}`;
        }
        return `${uri}${dbName}`;
    }
    if (!uri.includes('/') || uri.match(/^[^/]+\/\/[^/]+$/)) {
        return `${uri}/${dbName}`;
    }
    return uri;
};
const connectDB = async (mongoUri) => {
    let uri;
    try {
        uri = mongoUri || process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            uri = `mongodb://localhost:27017/${DEFAULT_DB_NAME}`;
        }
        else {
            uri = ensureDatabaseName(uri, DEFAULT_DB_NAME);
        }
        const conn = await mongoose_1.default.connect(uri, {});
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        console.log(`Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    }
    catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error(`Attempted URI: ${uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'undefined'}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map