'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  if (session.status === 'loading') {
    return <div>Loading...</div>;
  }
  if (session.status === 'unauthenticated') {
    return redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
    );
  }
  if (session.status === 'authenticated') return <div>{children}</div>;

  return null;
}
