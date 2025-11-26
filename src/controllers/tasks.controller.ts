import { Response } from 'express';
import { getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class TasksController {
  static async getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { sort = 'created_at', order = 'desc', completed } = req.query;

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', req.user!.id);

      if (completed) {
        query = query.eq('completed', completed);
      }

      query = query.order(sort as string, { ascending: order === 'asc' });

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch tasks', { error, userId: req.user!.id });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch tasks', 500);
        return;
      }

      // Transform to match frontend expectation
      const items = data.map(task => ({
        _id: task.id,
        _uid: task.user_id,
        ...task,
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get tasks error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch tasks', 500);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const taskData = {
        ...req.body,
        user_id: req.user!.id,
      };

      // Remove _uid and _id if present
      delete taskData._uid;
      delete taskData._id;

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create task', { error, userId: req.user!.id });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create task', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create task error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create task', 500);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update task', { error, taskId: id });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update task', 500);
        return;
      }

      if (!data) {
        errorResponse(res, 'NOT_FOUND', 'Task not found', 404);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update task error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update task', 500);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete task', { error, taskId: id });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete task', 500);
        return;
      }

      successResponse(res, { message: 'Task deleted successfully' });
    } catch (error) {
      logger.error('Delete task error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete task', 500);
    }
  }
}
