import NextAuth, { type NextAuthResult } from 'next-auth';
import Google from 'next-auth/providers/google';

const ALLOWED_EMAILS =
  process.env.AUTH_ALLOW_EMAILS?.split(',').map((e) =>
    e.trim().toLowerCase()
  ) || [];

const nextAuth: NextAuthResult = NextAuth({
  pages: {
    signIn: '/auth/login'
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();

      // If ALLOWED_EMAILS is not set, allow all users to sign in
      if (ALLOWED_EMAILS.length === 0) {
        return true;
      }

      // Check if email is in the allowed list
      if (!email || !ALLOWED_EMAILS.includes(email)) {
        return '/auth/login?error=unauthorized';
      }

      return true;
    }
  }
});

export const { auth, handlers, signIn, signOut } = nextAuth;
