import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      data: [
        { id: '1', keyword: 'a', pinned: false },
        { id: '2', keyword: 'other', pinned: false }
      ]
    }
  })
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('@/components/shadcn/command', () => ({
  CommandDialog: ({
    open,
    trigger,
    children
  }: {
    open?: boolean;
    trigger?: ReactNode;
    children?: ReactNode;
  }) => (
    <div>
      {trigger}
      {open ? children : null}
    </div>
  ),
  CommandEmpty: () => null,
  CommandInput: ({
    onValueChange: _onValueChange,
    ...props
  }: React.ComponentProps<'input'> & {
    onValueChange?: (value: string) => void;
  }) => <input {...props} />,
  CommandItem: ({ children }: { children?: ReactNode }) => (
    <div role="option">{children}</div>
  ),
  CommandList: ({ children }: { children?: ReactNode }) => <div>{children}</div>
}));

vi.mock('@/router', () => ({
  useTRPC: () => ({
    scraper: {
      getKeywords: {
        queryOptions: () => ({})
      }
    }
  })
}));

import KeywordSearch from './keyword-search';

describe('KeywordSearch', () => {
  it('shows the selected keyword while keeping all options available', async () => {
    const user = userEvent.setup();

    render(<KeywordSearch selectedKeyword="a" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('a');

    await user.click(input);

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'other' })).toBeInTheDocument();
  });
});
