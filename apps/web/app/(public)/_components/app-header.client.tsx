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
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

export default function AppHeader() {
  const session = useSession();
  const isScrolled = useScroll();

  return (
    <NavBar isScrolled={isScrolled}>
      {session.status === 'authenticated' ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar
                className={cn(
                  'transition-all duration-300',
                  isScrolled ? 'size-6' : 'size-8'
                )}
              >
                <AvatarImage src={session.data.user?.image || undefined} />
                <AvatarFallback className={isScrolled ? 'text-xs' : 'text-sm'}>
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
