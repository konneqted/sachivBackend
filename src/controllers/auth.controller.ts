import { Request, Response } from 'express';
import { getSupabaseClient, getSupabaseAdmin, getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        logger.error('OTP send failed', { email, error: error.message });
        errorResponse(res, 'OTP_SEND_FAILED', error.message, 400);
        return;
      }

      logger.info('OTP sent successfully', { email });
      successResponse(res, { message: 'OTP sent to your email' });
    } catch (error) {
      logger.error('Send OTP error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to send OTP', 500);
    }
  }

  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error || !data.user) {
        logger.warn('OTP verification failed', { email, error: error?.message });
        errorResponse(res, 'INVALID_OTP', 'Invalid or expired OTP', 400);
        return;
      }

      // Create or update profile
      const supabaseAdmin = getSupabaseAdmin();
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        logger.error('Profile creation failed', { error: profileError });
      }

      logger.info('User authenticated successfully', { userId: data.user.id });
      successResponse(res, {
        user: {
          uid: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || null,
          createdTime: new Date(data.user.created_at).getTime(),
          lastLoginTime: Date.now(),
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
        },
      });
    } catch (error) {
      logger.error('Verify OTP error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to verify OTP', 500);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        successResponse(res, { message: 'Logged out successfully' });
        return;
      }

      const token = authHeader.substring(7);
      const supabase = getSupabaseClient();

      await supabase.auth.admin.signOut(token);

      logger.info('User logged out', { userId: req.user?.id });
      successResponse(res, { message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error', { error });
      // Even if logout fails, respond with success for client-side cleanup
      successResponse(res, { message: 'Logged out successfully' });
    }
  }

  static async getSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 'UNAUTHORIZED', 'Not authenticated', 401);
        return;
      }

      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        logger.error('Failed to fetch user profile', { error });
        errorResponse(res, 'USER_NOT_FOUND', 'User profile not found', 404);
        return;
      }

      successResponse(res, {
        user: {
          uid: data.id,
          email: data.email,
          name: data.name,
          createdTime: new Date(data.created_at).getTime(),
          lastLoginTime: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Get session error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to get session', 500);
    }
  }
}
