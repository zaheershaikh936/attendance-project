import { Database } from './types';

export type SupabaseAuthExtended = {
  extends supabase.auth.AnyUser: Database['public']['extends']['auth']['users'];
};

export type SupabaseDbExtended = {
  extends database: Database;
};
