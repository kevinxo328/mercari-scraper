import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const nextAuth = NextAuth({
  pages: {
    signIn: '/auth/login'
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    })
  ]
});

export const { auth, handlers, signIn, signOut } = nextAuth;
