import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Radix UI Popover requires ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddKeywordDialog from './add-keyword-dialog';
import { useTRPC } from '@/trpc/client';
import { fireEvent } from '@testing-library/react';

// Mock trpc client
jest.mock('@/trpc/client', () => ({
  useTRPC: jest.fn()
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

const FIXTURE_TREE = [
  {
    value: 'root-a',
    label: 'Root A',
    children: [{ value: 'leaf-a1', label: 'Leaf A1' }]
  },
  { value: 'root-b', label: 'Root B' }
];

const FIXTURE_MAP: Record<string, { label: string; path: string[] }> = {
  'root-a': { label: 'Root A', path: ['Root A'] },
  'leaf-a1': { label: 'Leaf A1', path: ['Root A', 'Leaf A1'] },
  'root-b': { label: 'Root B', path: ['Root B'] }
};

function mockTRPC(overrides = {}) {
  const base = {
    scraper: {
      getCategories: {
        queryOptions: () => ({
          queryKey: ['categories'],
          queryFn: async () => ({ tree: FIXTURE_TREE, map: FIXTURE_MAP })
        })
      },
      createKeyword: {
        mutationOptions: (opts: {
          onSuccess?: () => void;
          onError?: () => void;
        }) => ({
          mutationFn: jest.fn().mockResolvedValue({}),
          ...opts
        })
      },
      updateKeyword: {
        mutationOptions: (opts: {
          onSuccess?: () => void;
          onError?: () => void;
        }) => ({
          mutationFn: jest.fn().mockResolvedValue({}),
          ...opts
        })
      },
      getKeywords: { pathFilter: () => ({ queryKey: ['keywords'] }) }
    },
    ...overrides
  };
  (useTRPC as jest.Mock).mockReturnValue(base);
  return base;
}

function renderDialog(props = {}) {
  mockTRPC();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddKeywordDialog open={true} onOpenChange={jest.fn()} {...props}>
        <button>Open</button>
      </AddKeywordDialog>
    </QueryClientProvider>
  );
}

describe('AddKeywordDialog with TreeSelect', () => {
  it('renders the category tree select', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  it('pre-populates categoryIds in edit mode', async () => {
    const keyword = {
      id: '1',
      keyword: 'test',
      minPrice: null,
      maxPrice: null,
      categoryIds: ['root-b'],
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    renderDialog({ keywordToEdit: keyword });
    await waitFor(() => {
      // 'root-b' path slice(1) = [] → falls back to label 'Root B'
      expect(screen.getByText('Root B')).toBeInTheDocument();
    });
  });
});
