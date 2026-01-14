import express, { Router } from 'express';
const router: Router = express.Router();
import upload from '../utils/upload';
import path from 'path';
import { validateUploadedFile, handleMulterError } from '../middleware/fileValidation';

// POST /api/upload - Upload a file
router.post('/', (upload as any).single('file'), handleMulterError, validateUploadedFile(), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Construct the correct path for frontend access
    // req.file.path is the full path like: ./uploads/images/file-123.jpg or uploads/images/file-123.jpg
    // We need: /uploads/images/file-123.jpg
    
    let filePath = req.file.path.replace(/\\/g, '/');
    
    // Remove leading ./ if present
    if (filePath.startsWith('./')) {
      filePath = filePath.substring(2);
    }
    
    // Ensure it starts with /uploads/
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', (upload as any).array('files', 10), handleMulterError, validateUploadedFile(), (req: any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const files = req.files.map((file: any) => {
      // Construct the correct path for frontend access
      let filePath = file.path.replace(/\\/g, '/');
      
      // Remove leading ./ if present
      if (filePath.startsWith('./')) {
        filePath = filePath.substring(2);
      }
      
      // Ensure it starts with /uploads/
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;