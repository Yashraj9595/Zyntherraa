import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_DB_NAME = 'zyntherraa';

/**
 * Ensures the database name in the URI is set to the default name
 * Handles both mongodb:// and mongodb+srv:// formats with or without authentication
 */
const ensureDatabaseName = (uri: string, dbName: string): string => {
  // Pattern to match: protocol://[user:pass@]host[:port]/database[?options]
  // Handles: mongodb://host:port/db, mongodb://user:pass@host:port/db, mongodb+srv://host/db
  
  // Check if URI already has a database name (after the last / before ?)
  // Match: protocol://[auth@]host[:port]/dbname[?options]
  const dbNamePattern = /^((?:mongodb\+srv|mongodb):\/\/[^/]+)\/([^/?]+)(\?.*)?$/;
  const match = uri.match(dbNamePattern);
  
  if (match) {
    // Replace existing database name
    const protocolAndHost = match[1];
    const queryParams = match[3] || '';
    return `${protocolAndHost}/${dbName}${queryParams}`;
  }
  
  // Check if URI has no database name (ends with / or has ? without /)
  // Match: protocol://[auth@]host[:port]/[?options] or protocol://[auth@]host[:port]?options
  const noDbPattern = /^((?:mongodb\+srv|mongodb):\/\/[^/?]+)(\/?)(\?.*)?$/;
  const noDbMatch = uri.match(noDbPattern);
  
  if (noDbMatch) {
    // Add database name
    const protocolAndHost = noDbMatch[1];
    const queryParams = noDbMatch[3] || '';
    return `${protocolAndHost}/${dbName}${queryParams}`;
  }
  
  // Fallback: if pattern doesn't match, try simple append
  if (uri.endsWith('/')) {
    const queryIndex = uri.indexOf('?');
    if (queryIndex > 0) {
      return `${uri.substring(0, queryIndex)}${dbName}${uri.substring(queryIndex)}`;
    }
    return `${uri}${dbName}`;
  }
  
  // If URI doesn't have a slash after host, add it
  if (!uri.includes('/') || uri.match(/^[^/]+\/\/[^/]+$/)) {
    return `${uri}/${dbName}`;
  }
  
  return uri;
};

export const connectDB = async (mongoUri?: string): Promise<void> => {
  let uri: string | undefined;
  
  try {
    uri = mongoUri || process.env.MONGO_URI || process.env.MONGODB_URI;
    
    // If no URI provided, use default localhost with default database name
    if (!uri) {
      uri = `mongodb://localhost:27017/${DEFAULT_DB_NAME}`;
    } else {
      // Ensure the database name is set to the default
      uri = ensureDatabaseName(uri, DEFAULT_DB_NAME);
    }

    const conn = await mongoose.connect(uri, {
      // Modern Mongoose doesn't need these options, but they're safe to include
      // for compatibility with older MongoDB versions
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Attempted URI: ${uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'undefined'}`);
    process.exit(1);
  }
};