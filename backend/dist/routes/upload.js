"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const upload_1 = __importDefault(require("../utils/upload"));
const fileValidation_1 = require("../middleware/fileValidation");
router.post('/', upload_1.default.single('file'), fileValidation_1.handleMulterError, (0, fileValidation_1.validateUploadedFile)(), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        let filePath = req.file.path.replace(/\\/g, '/');
        if (filePath.startsWith('./')) {
            filePath = filePath.substring(2);
        }
        const normalizedPath = filePath.startsWith('/uploads/')
            ? filePath
            : filePath.startsWith('uploads/')
                ? `/${filePath}`
                : `/uploads/${filePath}`;
        console.log('File upload:', {
            originalPath: req.file.path,
            normalizedPath: normalizedPath,
            filename: req.file.filename,
            destination: req.file.destination
        });
        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: normalizedPath,
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
router.post('/multiple', upload_1.default.array('files', 10), fileValidation_1.handleMulterError, (0, fileValidation_1.validateUploadedFile)(), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const files = req.files.map((file) => {
            let filePath = file.path.replace(/\\/g, '/');
            if (filePath.startsWith('./')) {
                filePath = filePath.substring(2);
            }
            const normalizedPath = filePath.startsWith('/uploads/')
                ? filePath
                : filePath.startsWith('uploads/')
                    ? `/${filePath}`
                    : `/uploads/${filePath}`;
            return {
                filename: file.filename,
                path: normalizedPath,
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