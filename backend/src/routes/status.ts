import express, { Router } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import User from '../models/User';
import packageJson from '../../package.json';

const router: Router = express.Router();

type CheckStatus = 'pass' | 'fail';

interface StatusCheck {
  name: string;
  status: CheckStatus;
  detail?: string;
  durationMs?: number;
}

const DB_STATE_MAP: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
};

const runModelCheck = async (name: string, model: mongoose.Model<any>): Promise<StatusCheck> => {
  const startedAt = Date.now();
  try {
    await model.findOne().select('_id').lean();
    return {
      name,
      status: 'pass',
      durationMs: Date.now() - startedAt,
    };
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      detail: error?.message || 'Unknown error',
      durationMs: Date.now() - startedAt,
    };
  }
};

const getDatabaseStatus = async (): Promise<{
  status: CheckStatus;
  state: string;
  detail?: string;
  host?: string;
  name?: string;
  durationMs: number;
}> => {
  const startedAt = Date.now();
  const readyState = mongoose.connection.readyState;
  const stateLabel = DB_STATE_MAP[readyState] || 'unknown';

  if (readyState !== 1) {
    return {
      status: 'fail',
      state: stateLabel,
      detail: 'Database connection is not ready',
      host: mongoose.connection.host ?? undefined,
      name: mongoose.connection.name ?? undefined,
      durationMs: Date.now() - startedAt,
    };
  }

  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: 'pass',
      state: stateLabel,
      host: mongoose.connection.host ?? undefined,
      name: mongoose.connection.name ?? undefined,
      durationMs: Date.now() - startedAt,
    };
  } catch (error: any) {
    return {
      status: 'fail',
      state: stateLabel,
      detail: error?.message || 'Failed to ping database',
      host: mongoose.connection.host ?? undefined,
      name: mongoose.connection.name ?? undefined,
      durationMs: Date.now() - startedAt,
    };
  }
};

router.get('/', async (_req, res) => {
  const startedAt = Date.now();

  const dbStatus = await getDatabaseStatus();

  const modelChecks = await Promise.all([
    runModelCheck('products', Product),
    runModelCheck('categories', Category),
    runModelCheck('orders', Order),
    runModelCheck('users', User),
  ]);

  const allChecks = [dbStatus, ...modelChecks];
  const hasFailure = allChecks.some((check) => check.status === 'fail');

  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  const metrics = {
    uptime: {
      seconds: uptimeSeconds,
      humanReadable: formatDuration(uptimeSeconds),
    },
    memory: {
      rssMb: Number((memoryUsage.rss / 1024 / 1024).toFixed(2)),
      heapUsedMb: Number((memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMb: Number((memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
      externalMb: Number((memoryUsage.external / 1024 / 1024).toFixed(2)),
    },
    cpuLoad: os.loadavg(),
    responseTimeMs: Date.now() - startedAt,
  };

  const endpoints = [
    { method: 'GET', path: '/api/health', description: 'Basic health check' },
    { method: 'GET', path: '/api/status', description: 'Comprehensive service status' },
    { method: 'GET', path: '/api/products', description: 'List products' },
    { method: 'GET', path: '/api/categories', description: 'List categories' },
    { method: 'GET', path: '/api/users', description: 'List users (requires admin auth)' },
    { method: 'GET', path: '/api/orders', description: 'List orders (requires auth)' },
    { method: 'POST', path: '/api/users/login', description: 'User login' },
    { method: 'POST', path: '/api/users/register', description: 'User registration' },
  ];

  const statusPayload = {
    status: hasFailure ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: packageJson.version || '1.0.0',
    checks: {
      database: dbStatus,
      services: modelChecks,
    },
    metrics,
    endpoints,
  };

  res.status(hasFailure ? 503 : 200).json(statusPayload);
});

export default router;

