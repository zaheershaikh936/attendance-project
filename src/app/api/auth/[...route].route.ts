import { handleAuth, type NextAuthRequestHandler } from 'next-auth/react';
import { GET as authGet, POST as authPost } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const config: NextAuthRequestHandler = {
  matcher: '/api/auth/:path*',
};

export const GET = handleAuth(authGet);
export const POST = handleAuth(authPost);
