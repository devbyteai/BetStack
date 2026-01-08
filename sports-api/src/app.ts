import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { requestLogger } from './shared/middleware/requestLogger.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';
import { env } from './config/env.js';
import routes from './routes.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - strict in production, permissive in development
const getCorsOrigin = (): string | string[] | boolean => {
  // In production, CORS_ORIGIN is required
  if (env.NODE_ENV === 'production') {
    if (!env.CORS_ORIGIN) {
      console.error('FATAL: CORS_ORIGIN environment variable is required in production');
      process.exit(1);
    }
    // Support comma-separated list of origins
    return env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // In development/test, allow all origins if not specified
  return env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : true;
};

app.use(cors({
  origin: getCorsOrigin(),
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));
app.use(requestLogger);

// Rate limiting
app.use('/api/v1', apiLimiter);

// Routes
app.use('/api/v1', routes);

// Health check at root
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
