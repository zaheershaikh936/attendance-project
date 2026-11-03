import { nextAuth } from 'next-auth';
import { GoogleProvider } from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    cookieSessionStorage: true,
    maxAge: 7200,
  },
};

export const handler = nextAuth(authOptions);
