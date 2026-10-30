import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { configureSession } from './config/session.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { checkDatabaseConnection } from './config/db.js';
import { ApiResponse } from './utils/apiResponse.js';

const app = express();

// Trust reverse proxy (e.g., NGINX, Docker)
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite dev client in development
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP address. Please try again later.',
      details: [],
    },
  },
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Stateful Session Management (MySQL backed)
app.use(configureSession());

// System Health Check
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  return ApiResponse.success(res, {
    message: 'Smart Campus API service operational.',
    data: {
      service: 'smart-campus-api',
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: dbHealth.connected ? 'CONNECTED' : 'DISCONNECTED',
      databaseHost: process.env.DB_HOST || 'localhost',
    },
  });
});

// Mount Central API Routes
app.use('/api', apiRoutes);

// Catch Unmatched Routes (404)
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;

