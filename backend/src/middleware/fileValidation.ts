import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { validateUploadedFileContent } from '../utils/fileContentValidator';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default

// Validate file type
export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

// Validate file size
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

// Get max size for file type
export const getMaxSizeForType = (mimetype: string): number => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return MAX_IMAGE_SIZE;
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) {
    return MAX_VIDEO_SIZE;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
    return MAX_DOCUMENT_SIZE;
  }
  return MAX_FILE_SIZE;
};

// File validation middleware
export const validateUploadedFile = (
  allowedTypes: string[] = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
  maxSize: number = MAX_FILE_SIZE
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next(); // Let multer handle missing file error
    }

    // Normalize files to array
    let files: Express.Multer.File[] = [];
    if (req.file) {
      files = [req.file];
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // req.files is a dictionary, extract all files
        files = Object.values(req.files).flat();
      }
    }

    for (const file of files) {
      if (!file) continue;

      // Validate file type
      if (!validateFileType(file.mimetype, allowedTypes)) {
        return res.status(400).json({
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
          receivedType: file.mimetype,
        });
      }

      // Validate file size
      const maxSizeForType = getMaxSizeForType(file.mimetype);
      const actualMaxSize = maxSize < maxSizeForType ? maxSize : maxSizeForType;

      if (!validateFileSize(file.size, actualMaxSize)) {
        return res.status(400).json({
          message: `File size exceeds maximum allowed size of ${actualMaxSize / (1024 * 1024)}MB`,
          receivedSize: file.size,
          maxSize: actualMaxSize,
        });
      }

      // Additional security: Check file extension matches mimetype
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      const extensionMap: Record<string, string[]> = {
        jpg: ['image/jpeg', 'image/jpg'],
        jpeg: ['image/jpeg', 'image/jpg'],
        png: ['image/png'],
        webp: ['image/webp'],
        gif: ['image/gif'],
        mp4: ['video/mp4'],
        webm: ['video/webm'],
        ogg: ['video/ogg'],
        pdf: ['application/pdf'],
      };

      if (extension && extensionMap[extension]) {
        if (!extensionMap[extension].includes(file.mimetype)) {
          return res.status(400).json({
            message: 'File extension does not match file type',
            extension,
            mimetype: file.mimetype,
          });
        }
      }

      // Validate file content (magic bytes) - security check
      try {
        const isValidContent = await validateUploadedFileContent(file, file.mimetype);
        if (!isValidContent) {
          return res.status(400).json({
            message: 'File content does not match declared file type. File may be corrupted or malicious.',
            mimetype: file.mimetype,
          });
        }
      } catch (contentError) {
        console.error('File content validation error:', contentError);
        // Don't fail the upload if content validation has an error, but log it
        // In production, you might want to be stricter
        if (process.env.NODE_ENV === 'production') {
          return res.status(400).json({
            message: 'File validation failed. Please ensure the file is valid.',
          });
        }
      }
    }

    next();
  };
};

// Image validation middleware
export const validateImage = validateUploadedFile(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);

// Video validation middleware
export const validateVideo = validateUploadedFile(ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE);

// Document validation middleware
export const validateDocument = validateUploadedFile(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE);

// Error handler for multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size exceeds maximum allowed size',
        error: err.message,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files uploaded',
        error: err.message,
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field',
        error: err.message,
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message,
    });
  }

  next();
};

