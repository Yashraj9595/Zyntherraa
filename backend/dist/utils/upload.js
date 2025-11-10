"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let subDir = 'misc';
        if (file.mimetype.startsWith('image/')) {
            subDir = 'images';
        }
        else if (file.mimetype.startsWith('video/')) {
            subDir = 'videos';
        }
        const fullPath = path.join(uploadPath, subDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
exports.default = upload;
//# sourceMappingURL=upload.js.map