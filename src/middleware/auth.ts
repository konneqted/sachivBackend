import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    token: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Authentication failed', { error: error?.message });
      errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email!,
      token: token,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    errorResponse(res, 'INTERNAL_ERROR', 'Authentication error', 500);
  }
}
