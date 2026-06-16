import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const keywordSearchModuleLoaded = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => vi.fn()
}));

vi.mock('@/components/keyword-search', () => {
  keywordSearchModuleLoaded();
  return {
    default: () => <div data-testid="keyword-search" />
  };
});

vi.mock('@/components/navbar', () => ({
  default: ({
    children,
    centerSlot
  }: {
    children?: React.ReactNode;
    centerSlot?: React.ReactNode;
  }) => (
    <header>
      {centerSlot}
      {children}
    </header>
  )
}));

vi.mock('@/components/shadcn/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarImage: () => null
}));

vi.mock('@/components/shadcn/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  )
}));

vi.mock('@/lib/auth-client', () => ({
  signOut: vi.fn(),
  useSession: () => ({ data: null })
}));

describe('AppHeader', () => {
  it('does not load keyword search when the header module is imported', async () => {
    const { default: AppHeader } = await import('./app-header');

    expect(keywordSearchModuleLoaded).not.toHaveBeenCalled();

    render(<AppHeader />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
