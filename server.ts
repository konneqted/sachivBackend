import express from 'express';
import helmet from 'helmet';
import { env } from './src/config/env.js';
import { corsMiddleware } from './src/middleware/cors.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { requestIdMiddleware } from './src/middleware/requestId.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/utils/logger.js';
import routes from './src/routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);

// Request processing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request tracking
app.use(requestIdMiddleware);

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    requestId: req.headers['x-request-id'],
  });
  next();
});

// API routes
app.use(`/api/${env.API_VERSION}`, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API Version: ${env.API_VERSION}`);
});

export default app;
