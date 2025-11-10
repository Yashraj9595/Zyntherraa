"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async (mongoUri) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';
        const conn = await mongoose_1.default.connect(uri, {});
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map