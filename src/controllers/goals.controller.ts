import { Response } from 'express';
import { getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class GoalsController {
  static async getGoals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch goals', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch goals', 500);
        return;
      }

      const items = data.map(goal => ({
        _id: goal.id,
        _uid: goal.user_id,
        ...goal,
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get goals error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch goals', 500);
    }
  }

  static async createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const goalData = {
        ...req.body,
        user_id: req.user!.id,
      };

      delete goalData._uid;
      delete goalData._id;

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create goal', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create goal', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create goal error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create goal', 500);
    }
  }

  static async updateGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update goal', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update goal', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update goal error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update goal', 500);
    }
  }

  static async deleteGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete goal', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete goal', 500);
        return;
      }

      successResponse(res, { message: 'Goal deleted successfully' });
    } catch (error) {
      logger.error('Delete goal error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete goal', 500);
    }
  }

  static async getMilestones(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('order_index', { ascending: true });

      if (error) {
        logger.error('Failed to fetch milestones', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch milestones', 500);
        return;
      }

      const items = data.map(milestone => ({
        _id: milestone.id,
        _uid: milestone.user_id,
        order: milestone.order_index,
        completed: milestone.completed ? 'true' : 'false',
        ...milestone,
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get milestones error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch milestones', 500);
    }
  }

  static async createMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const milestoneData = {
        ...req.body,
        user_id: req.user!.id,
        order_index: req.body.order || req.body.order_index || 1,
        completed: req.body.completed === 'true' || req.body.completed === true,
      };

      delete milestoneData._uid;
      delete milestoneData._id;
      delete milestoneData.order;

      const { data, error } = await supabase
        .from('milestones')
        .insert(milestoneData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create milestone', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create milestone', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        order: data.order_index,
        completed: data.completed ? 'true' : 'false',
        ...data,
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create milestone error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create milestone', 500);
    }
  }

  static async updateMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      if (updates.order !== undefined) {
        updates.order_index = updates.order;
        delete updates.order;
      }
      if (updates.completed !== undefined) {
        updates.completed = updates.completed === 'true' || updates.completed === true;
      }
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update milestone', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update milestone', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        order: data.order_index,
        completed: data.completed ? 'true' : 'false',
        ...data,
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update milestone error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update milestone', 500);
    }
  }

  static async deleteMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete milestone', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete milestone', 500);
        return;
      }

      successResponse(res, { message: 'Milestone deleted successfully' });
    } catch (error) {
      logger.error('Delete milestone error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete milestone', 500);
    }
  }
}
