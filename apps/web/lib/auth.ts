import NextAuth, { type NextAuthResult } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const ALLOWED_EMAILS =
  process.env.AUTH_ALLOW_EMAILS?.split(',').map((e) =>
    e.trim().toLowerCase()
  ) || [];

const providers: any[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!
  })
];

// Add Credentials provider for development environment to bypass Google Auth automation restrictions
if (process.env.NODE_ENV === 'development') {
  providers.push(
    Credentials({
      name: 'Dev Login',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'test@example.com'
        }
      },
      async authorize(credentials) {
        return {
          id: 'dev-user-id',
          name: 'Dev User',
          email: (credentials?.email as string) || 'test@example.com',
          image: 'https://avatar.vercel.sh/dev'
        };
      }
    })
  );
}

const nextAuth: NextAuthResult = NextAuth({
  pages: {
    signIn: '/auth/login'
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Bypass allowed emails check for credentials provider (dev only)
      if (account?.provider === 'credentials') {
        return true;
      }

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
