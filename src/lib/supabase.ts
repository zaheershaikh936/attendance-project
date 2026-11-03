import { createClient, type Database } from 'supabase';

const SUPABASE_URL = import.meta.env.SUPABASE_URL || '';
const SUPABASE_ANON_PUBLIC_KEY = import.meta.env.SUPABASE_ANON_PUBLIC_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient<Database>(SUPABASE_URL, {
  key: SUPABASE_ANON_PUBLIC_KEY,
  signalingClient: false,
  cache: true,
});

// Service role for server-side functions (only available in Next.js API routes)
export async function getServiceRoleClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient<Database>(SUPABASE_URL, {
    key: SUPABASE_SERVICE_ROLE_KEY,
    signalingClient: false,
    cache: true,
  });
}

// Create Supabase client for employee sessions (authenticated)
export async function getAuthUser() {
  const result = await supabase.auth.getUser();
  return result;
}

export async function getSession() {
  const result = await supabase.auth.getSession();
  return result;
}
