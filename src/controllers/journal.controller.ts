import { Response } from 'express';
import { getSupabaseClientForUser } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class JournalController {
  static async getEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('date', { ascending: false });

      if (error) {
        logger.error('Failed to fetch journal entries', { error });
        errorResponse(res, 'FETCH_FAILED', 'Failed to fetch journal entries', 500);
        return;
      }

      const items = data.map(entry => ({
        _id: entry.id,
        _uid: entry.user_id,
        ...entry,
      }));

      successResponse(res, { items });
    } catch (error) {
      logger.error('Get journal entries error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to fetch journal entries', 500);
    }
  }

  static async createEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseClientForUser(req);
      const entryData = {
        ...req.body,
        user_id: req.user!.id,
      };

      delete entryData._uid;
      delete entryData._id;

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create journal entry', { error });
        errorResponse(res, 'CREATE_FAILED', 'Failed to create journal entry', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item }, 201);
    } catch (error) {
      logger.error('Create journal entry error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to create journal entry', 500);
    }
  }

  static async updateEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);
      
      const updates = { ...req.body };
      delete updates._uid;
      delete updates._id;
      delete updates.user_id;

      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update journal entry', { error });
        errorResponse(res, 'UPDATE_FAILED', 'Failed to update journal entry', 500);
        return;
      }

      const item = {
        _id: data.id,
        _uid: data.user_id,
        ...data,
      };

      successResponse(res, { item });
    } catch (error) {
      logger.error('Update journal entry error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to update journal entry', 500);
    }
  }

  static async deleteEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClientForUser(req);

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

      if (error) {
        logger.error('Failed to delete journal entry', { error });
        errorResponse(res, 'DELETE_FAILED', 'Failed to delete journal entry', 500);
        return;
      }

      successResponse(res, { message: 'Journal entry deleted successfully' });
    } catch (error) {
      logger.error('Delete journal entry error', { error });
      errorResponse(res, 'INTERNAL_ERROR', 'Failed to delete journal entry', 500);
    }
  }
}
