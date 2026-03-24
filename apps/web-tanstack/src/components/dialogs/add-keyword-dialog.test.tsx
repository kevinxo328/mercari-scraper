import { render, screen, waitFor } from '@testing-library/react';

// Radix UI Popover requires ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AddKeywordDialog from './add-keyword-dialog';

// Mock @/router so the component's `useTRPC` hook returns fixtures
vi.mock('@/router', () => ({
  useTRPC: () => ({
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
          mutationFn: vi.fn().mockResolvedValue({}),
          ...opts
        })
      },
      updateKeyword: {
        mutationOptions: (opts: {
          onSuccess?: () => void;
          onError?: () => void;
        }) => ({
          mutationFn: vi.fn().mockResolvedValue({}),
          ...opts
        })
      },
      getKeywords: { pathFilter: () => ({ queryKey: ['keywords'] }) }
    }
  })
}));

// Mock sonner toast helpers
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

// Mock the local Toaster wrapper to avoid pulling in next-themes (not installed)
vi.mock('@/components/shadcn/sonner', () => ({
  Toaster: () => null
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

function renderDialog(props = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddKeywordDialog open={true} onOpenChange={vi.fn()} {...props}>
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
