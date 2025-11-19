import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  return <div>{children}</div>;
}
