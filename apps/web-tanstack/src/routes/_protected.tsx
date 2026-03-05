import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { getSession } from '@/lib/auth-server';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href }
      });
    }

    return { user: session.user };
  },
  component: () => <Outlet />
});
