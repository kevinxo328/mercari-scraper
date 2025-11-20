'use client';

import NavBar from '@/components/navbar';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/dist/client/link';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/shadcn/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu';
import { redirect } from 'next/navigation';

export default function AppHeader() {
  const session = useSession();

  return (
    <NavBar>
      {session.status === 'authenticated' ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={session.data.user?.image || undefined} />
                <AvatarFallback>
                  {session.data.user?.name
                    ? session.data.user.name.charAt(0)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => redirect('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => signOut()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
      {session.status === 'unauthenticated' ? (
        <Link href="/auth/login">Login</Link>
      ) : null}
    </NavBar>
  );
}
