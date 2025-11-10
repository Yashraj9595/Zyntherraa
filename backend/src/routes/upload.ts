import express, { Router } from 'express';
const router: Router = express.Router();
import upload from '../utils/upload';
import path from 'path';

// POST /api/upload - Upload a file
router.post('/', (upload as any).single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Construct the correct path for frontend access
    // The file is saved in uploads/[subdir]/[filename]
    const relativePath = path.relative('./uploads', req.file.path).replace(/\\/g, '/');
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', (upload as any).array('files', 10), (req: any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const files = req.files.map((file: any) => {
      // Construct the correct path for frontend access
      // The file is saved in uploads/[subdir]/[filename]
      const relativePath = path.relative('./uploads', file.path).replace(/\\/g, '/');
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;