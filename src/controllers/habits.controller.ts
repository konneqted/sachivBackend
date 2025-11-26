import { Response } from 'express';
import { getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class HabitsController {
  static async getHabits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch habits', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch habits', 500);
        return;
      }

      const items = data.map((habit) => ({
        ...habit,
        _id: habit.id,
        _uid: habit.user_id,
        active: habit.active ? 'true' : 'false',
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get habits error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch habits', 500);
    }
  }

  static async createHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const habitData = {
        ...req.body,
        user_id: req.user!.id,
        active: req.body.active === 'true' || req.body.active === true,
      };

      delete habitData._uid;
      delete habitData._id;

      const { data, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create habit', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create habit', 500);
        return;
      }

      const item = {
        ...data,
        _id: data.id,
        _uid: data.user_id,
        active: data.active ? 'true' : 'false',
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create habit error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create habit', 500);
    }
  }

  static async updateHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      if (updates.active !== undefined) {
        updates.active = updates.active === 'true' || updates.active === true;
      }
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update habit', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update habit', 500);
        return;
      }

      const item = {
        ...data,
        _id: data.id,
        _uid: data.user_id,
        active: data.active ? 'true' : 'false',
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update habit error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update habit', 500);
    }
  }

  static async deleteHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete habit', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete habit', 500);
        return;
      }

      successResponse(res, { message: 'Habit deleted successfully' });
    } catch (error) {
      logger.error('Delete habit error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete habit', 500);
    }
  }

  static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('date', { ascending: false });

      if (error) {
        logger.error('Failed to fetch habit logs', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch habit logs', 500);
        return;
      }

      const items = data.map((log) => ({
        ...log,
        _id: log.id,
        _uid: log.user_id,
        completed: log.completed ? 'true' : 'false',
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get habit logs error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch habit logs', 500);
    }
  }

  static async createLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const logData = {
        ...req.body,
        user_id: req.user!.id,
        completed: req.body.completed === 'true' || req.body.completed === true,
      };

      delete logData._uid;
      delete logData._id;

      const { data, error } = await supabase
        .from('habit_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create habit log', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create habit log', 500);
        return;
      }

      const item = {
        ...data,
        _id: data.id,
        _uid: data.user_id,
        completed: data.completed ? 'true' : 'false',
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create habit log error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create habit log', 500);
    }
  }

  static async updateLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      if (updates.completed !== undefined) {
        updates.completed = updates.completed === 'true' || updates.completed === true;
      }
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('habit_logs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update habit log', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update habit log', 500);
        return;
      }

      const item = {
        ...data,
        _id: data.id,
        _uid: data.user_id,
        completed: data.completed ? 'true' : 'false',
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update habit log error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update habit log', 500);
    }
  }

  static async deleteLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete habit log', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete habit log', 500);
        return;
      }

      successResponse(res, { message: 'Habit log deleted successfully' });
    } catch (error) {
      logger.error('Delete habit log error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete habit log', 500);
    }
  }
}
