import { Link, useLocation, useNavigate } from '@tanstack/react-router';

import KeywordSearch from '@/components/keyword-search';
import NavBar from '@/components/navbar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/shadcn/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu';
import { signOut, useSession } from '@/lib/auth-client';

export default function AppHeader() {
  const session = useSession();
  const location = useLocation();
  const showSearch = !location.pathname.startsWith('/search');
  const navigate = useNavigate();

  return (
    <NavBar
      centerSlot={
        showSearch ? <KeywordSearch className="w-full max-w-125" /> : undefined
      }
    >
      {session.data ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-8">
                <AvatarImage src={session.data?.user?.image || undefined} />
                <AvatarFallback className="text-sm">
                  {session.data?.user?.name
                    ? session.data.user.name.charAt(0)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() =>
                  navigate({
                    to: '/dashboard'
                  })
                }
              >
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => navigate({ to: '/auth/login' })
                    }
                  })
                }
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link to="/auth/login">Login</Link>
      )}
    </NavBar>
  );
}
