import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import LoginForm from '@/components/forms/login-form';
import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from '@/lib/auth-errors';

const searchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional()
});

export const Route = createFileRoute('/_public/auth/login')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Login | Mercari Scraper' }] }),
  component: RouteComponent
});

function RouteComponent() {
  const { redirect, error } = Route.useSearch();

  useEffect(() => {
    if (!error) return;
    const message = AUTH_ERROR_MESSAGES[error as AuthErrorCode];
    if (message) toast.error(message);
  }, [error]);

  return (
    <main className="mx-auto p-4 container relative h-full flex items-center justify-center grow">
      <LoginForm redirect={redirect ?? '/dashboard'} />
    </main>
  );
}
