import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware to add a unique request ID to each request
 * This helps track requests across logs and error tracking services
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate or use existing request ID from header
  req.requestId = req.get('X-Request-ID') || uuidv4();
  
  // Add request ID to response header
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

