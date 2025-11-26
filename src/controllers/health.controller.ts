import { Response } from 'express';
import { getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class HealthController {
  static async getHealthData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { date } = req.query;

      let query = supabase
        .from('health_tracking')
        .select('*')
        .eq('user_id', req.user!.id);

      if (date) {
        query = query.eq('date', date as string);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch health data', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch health data', 500);
        return;
      }

      const items = data.map(item => ({
        _id: item.id,
        _uid: item.user_id,
        ...item,
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get health data error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch health data', 500);
    }
  }

  static async createHealthData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const healthData = {
        ...req.body,
        user_id: req.user!.id,
      };

      delete healthData._uid;
      delete healthData._id;

      const { data, error } = await supabase
        .from('health_tracking')
        .upsert(healthData, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create health data', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create health data', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create health data error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create health data', 500);
    }
  }

  static async updateHealthData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('health_tracking')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update health data', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update health data', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update health data error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update health data', 500);
    }
  }

  static async deleteHealthData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('health_tracking')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete health data', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete health data', 500);
        return;
      }

      successResponse(res, { message: 'Health data deleted successfully' });
    } catch (error) {
      logger.error('Delete health data error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete health data', 500);
    }
  }
}
