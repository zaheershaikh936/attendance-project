import { auth } from 'next-auth';
import NextAuth from 'next-auth';
import { GoogleProvider } from 'next-auth/providers/google';

export const { AUTH_TOKEN_SECRET } = auth();

const handler = auth({
  session: {
    cookieSessionStorage: true,
    strategy: 'jwt',
    maxAge: 7200,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
});

export const config = {
  matcher: ['/', '/(dashboard|login|register|api/:path*)'],
};
