import { createFileRoute, redirect } from '@tanstack/react-router';
import { resolveAuthError } from '@/lib/auth-errors';

export const Route = createFileRoute('/api/auth/error')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const raw = new URL(request.url).searchParams.get('error');
        throw redirect({
          to: '/auth/login',
          search: { error: resolveAuthError(raw) }
        });
      }
    }
  }
});
