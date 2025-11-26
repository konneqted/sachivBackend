import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  errorResponse(
    res,
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
