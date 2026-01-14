import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (requestId) {
      log = `${timestamp} [${level}] [${requestId}]: ${message}`;
    }
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { service: 'zyntherraa-backend' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // In production, also log to console but in JSON format
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}

// Logger interface with request context
export interface LoggerContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  userAgent?: string;
  [key: string]: any;
}

// Create a child logger with context
export const createLoggerWithContext = (context: LoggerContext) => {
  return logger.child(context);
};

// Helper functions for common logging scenarios
export const logRequest = (req: any, message: string, level: string = 'info', meta?: any) => {
  const context: LoggerContext = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?._id?.toString(),
    ...meta,
  };

  const childLogger = createLoggerWithContext(context);
  childLogger[level as keyof typeof childLogger](message);
};

export const logError = (error: Error, context?: LoggerContext) => {
  const childLogger = createLoggerWithContext(context || {});
  childLogger.error(error.message, {
    stack: error.stack,
    name: error.name,
  });
};

export const logApiError = (req: any, error: Error, statusCode?: number) => {
  const context: LoggerContext = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?._id?.toString(),
    statusCode,
    errorName: error.name,
  };

  const childLogger = createLoggerWithContext(context);
  childLogger.error(error.message, {
    stack: error.stack,
    name: error.name,
  });
};

// Export default logger
export default logger;

