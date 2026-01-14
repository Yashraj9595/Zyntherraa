import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import logger, { logApiError, LoggerContext } from '../utils/logger';

// Custom error class for application errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    requestId?: string;
    timestamp: string;
  };
  // Only include stack in development
  stack?: string;
}

/**
 * Main error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine status code
  let statusCode = 500;
  let errorCode: string | undefined;
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation error';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError') {
    // Handle MongoDB errors
    const mongoError = err as any;
    if (mongoError.code === 11000) {
      statusCode = 409;
      errorCode = 'DUPLICATE_ENTRY';
      message = 'Duplicate entry detected';
    } else {
      statusCode = 500;
      errorCode = 'DATABASE_ERROR';
      message = 'Database operation failed';
    }
  } else if (err.message) {
    message = err.message;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Log the error
  logApiError(req, err, statusCode);

  // Send to Sentry for error tracking (only in production or if explicitly enabled)
  if (process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true') {
    // Add context to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('requestId', req.requestId);
      scope.setTag('statusCode', statusCode.toString());
      scope.setContext('request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      });
      
      if ((req as any).user) {
        scope.setUser({
          id: (req as any).user._id?.toString(),
          email: (req as any).user.email,
        });
      }

      // Set severity based on status code
      if (statusCode >= 500) {
        scope.setLevel('error');
        Sentry.captureException(err);
      } else if (statusCode >= 400) {
        scope.setLevel('warning');
        // Only capture 4xx errors if they're operational errors
        if (err instanceof AppError && err.isOperational) {
          Sentry.captureException(err);
        }
      }
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper - wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Initialize Sentry error tracking
 */
export const initializeSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    logger.warn('Sentry DSN not configured. Error tracking will be disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production, 100% in dev
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        // Remove sensitive query params
        if (event.request.query_string) {
          const query = new URLSearchParams(event.request.query_string);
          query.delete('password');
          query.delete('token');
          event.request.query_string = query.toString();
        }
      }
      return event;
    },
  });

  logger.info('Sentry error tracking initialized', { environment });
};

