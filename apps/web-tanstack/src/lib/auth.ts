import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

const ALLOWED_EMAILS =
  process.env.AUTH_ALLOW_EMAILS?.split(',').map((e) =>
    e.trim().toLowerCase()
  ) || [];

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
      strategy: 'jwe', // can be "jwt" or "compact"
      refreshCache: true // Enable stateless refresh
    }
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase();
          if (
            ALLOWED_EMAILS.length > 0 &&
            (!email || !ALLOWED_EMAILS.includes(email))
          ) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Email is not in whitelist'
            });
          }
          return { data: user };
        }
      }
    }
  },
  plugins: [tanstackStartCookies()] // make sure this is the last plugin in the array
});
