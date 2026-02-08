import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = Infinity;
const INITIAL_RETRY_MS = 2000;
const MAX_RETRY_MS = 15000;

function isAuthError(message: string): boolean {
  const lower = (message || '').toLowerCase();
  return (
    lower.includes('authentication failed') ||
    lower.includes('auth failed') ||
    lower.includes('authentication error')
  );
}

function authFailureHint(): string {
  return [
    'MongoDB authentication failed. Check:',
    '  1. Username and password in MONGODB_URI / MONGO_URI are correct.',
    '  2. If the password contains special characters (@, #, :, /, ?, etc.), URL-encode them.',
    '  3. If the user was created in the admin db, add ?authSource=admin to the URI.',
    '  Example: mongodb://user:pass%40word@host:27017/zyntherraa?authSource=admin',
  ].join('\n');
}

function redactUri(uri: string): string {
  try {
    const url = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'https://'));
    const host = url.hostname + (url.port ? `:${url.port}` : '');
    const path = url.pathname && url.pathname !== '/' ? url.pathname : '/zyntherraa';
    return `mongodb://***:***@${host}${path}${url.search || ''}`;
  } catch {
    return 'mongodb://***:***@***';
  }
}

export const connectDB = async (mongoUri?: string): Promise<void> => {
  const uri = mongoUri || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';
  let attempt = 0;
  let delayMs = INITIAL_RETRY_MS;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      const conn = await mongoose.connect(uri, {});
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      const message = error?.message || String(error);
      console.error(`MongoDB connection failed (attempt ${attempt}): ${message}`);
      console.error(`Attempted URI: ${redactUri(uri)}`);
      if (isAuthError(message)) {
        console.error(authFailureHint());
      }
      if (attempt >= MAX_RETRIES) {
        console.error('Max retries reached. Exiting.');
        process.exit(1);
      }
      console.error(`Retrying in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
      delayMs = Math.min(delayMs * 2, MAX_RETRY_MS);
    }
  }
};
