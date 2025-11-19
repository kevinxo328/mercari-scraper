'use client';

import NavBar from '@/components/navbar';
import { Button } from '@/components/shadcn/button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/dist/client/link';

export default function AppHeader() {
  const session = useSession();

  return (
    <NavBar>
      {session.status === 'authenticated' ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Button
            onClick={() => signOut()}
            variant="link"
            className="hover:no-underline hover:cursor-pointer text-[1rem] p-0 font-normal"
          >
            Logout
          </Button>
        </>
      ) : null}
      {session.status === 'unauthenticated' ? (
        <Link href="/auth/login">Login</Link>
      ) : null}
    </NavBar>
  );
}
