import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

export function getSupabaseClientForUser(req: AuthenticatedRequest): SupabaseClient {
  if (!req.user?.token) {
    throw new Error('No user token provided for Supabase client');
  }
  
  // Create a new client for each request, authenticated with the user's token
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${req.user.token}`,
      },
    },
  });
}
