import { createServerClient, type Session } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  (url) => ({
    anonKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  }),
);

export async function authenticate() {
  const cookieStore = await cookies();
  const { data: { secureSession }, user } = await supabase.auth.getSession({ cookieStore });

  if (!secureSession) {
    redirect('/login');
  }

  return { user, session: secureSession as Session };
}

export async function signUp() {
  const cookieStore = await cookies();
  const { data } = await supabase.auth.signUp({ cookieStore });
  return data;
}

export async function login(formData: FormData) {
  const { password } = Object.fromEntries(formData);
  const { data } = await supabase.auth.signInWithPassword({ password });

  if (!data.user) {
    redirect('/login');
  }

  return { user: data.user };
}

export async function logout() {
  const cookieStore = await cookies();
  await supabase.auth.signOut({ cookieStore });
  redirect('/login');
}

export async function handleUnsubscribe(sessionId: string) {
  await supabase.tasks.delete(`unsubscribe_${sessionId}`);
  return { ok: true };
}

export async function getSession() {
  const cookieStore = await cookies();
  const { data: { secureSession }, user } = await supabase.auth.getSession({ cookieStore });

  if (!secureSession) {
    redirect('/login');
  }

  return { user, session: secureSession as Session };
}
