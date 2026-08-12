import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const keywordSearchModuleLoaded = vi.hoisted(() => vi.fn());
const location = vi.hoisted(() =>
  vi.fn(() => ({ pathname: '/', href: '/', search: {} }))
);
const keywordSearchInstance = vi.hoisted(() => ({ nextId: 0 }));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => location(),
  useNavigate: () => vi.fn()
}));

vi.mock('@/components/keyword-search', () => {
  keywordSearchModuleLoaded();
  return {
    default: ({ selectedKeyword }: { selectedKeyword?: string }) => {
      const [instanceId] = useState(() => ++keywordSearchInstance.nextId);
      return (
        <div
          data-testid="keyword-search"
          data-instance-id={instanceId}
          data-selected-keyword={selectedKeyword ?? ''}
        />
      );
    }
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

  it('renders keyword search on the search page', async () => {
    location.mockReturnValue({
      pathname: '/search',
      href: '/search',
      search: {}
    });
    const { default: AppHeader } = await import('./app-header');

    render(<AppHeader />);

    expect(await screen.findByTestId('keyword-search')).toBeInTheDocument();
  });

  it('resets keyword search state when the search URL changes', async () => {
    location.mockReturnValue({
      pathname: '/search',
      href: '/search?keyword=a',
      search: { keyword: 'a' }
    });
    const { default: AppHeader } = await import('./app-header');
    const view = render(<AppHeader />);
    const firstInstance = await screen.findByTestId('keyword-search');
    expect(firstInstance).toHaveAttribute('data-selected-keyword', 'a');

    location.mockReturnValue({
      pathname: '/search',
      href: '/search?keyword=b',
      search: { keyword: 'b' }
    });
    view.rerender(<AppHeader />);

    const nextInstance = await screen.findByTestId('keyword-search');
    expect(nextInstance).toHaveAttribute('data-selected-keyword', 'b');
    expect(nextInstance).not.toHaveAttribute(
      'data-instance-id',
      firstInstance.getAttribute('data-instance-id')
    );
  });
});
