"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const upload_1 = __importDefault(require("../utils/upload"));
const path_1 = __importDefault(require("path"));
router.post('/', upload_1.default.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const relativePath = path_1.default.relative('./uploads', req.file.path).replace(/\\/g, '/');
        const filePath = `/uploads/${relativePath}`;
        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: filePath,
                fullPath: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/multiple', upload_1.default.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const files = req.files.map((file) => {
            const relativePath = path_1.default.relative('./uploads', file.path).replace(/\\/g, '/');
            const filePath = `/uploads/${relativePath}`;
            return {
                filename: file.filename,
                path: filePath,
                fullPath: file.path,
                size: file.size,
                mimetype: file.mimetype
            };
        });
        res.status(201).json({
            message: 'Files uploaded successfully',
            files
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map