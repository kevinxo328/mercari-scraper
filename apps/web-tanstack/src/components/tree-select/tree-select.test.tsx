import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import {
  TreeSelect,
  TreeSelectContent,
  TreeSelectGroup,
  TreeSelectTrigger
} from './index';
import { TreeNode } from './types';
import {
  buildFlatMap,
  filterNodes,
  getDescendantValues,
  getIndeterminate,
  hasSelectedAncestor
} from './utils';

// Fixture tree:
// root-a
//   mid-a1
//     leaf-a1x
//     leaf-a1y
//   mid-a2
// root-b
//   leaf-b1
const FIXTURE_TREE: TreeNode[] = [
  {
    value: 'root-a',
    label: 'Root A',
    children: [
      {
        value: 'mid-a1',
        label: 'Mid A1',
        children: [
          { value: 'leaf-a1x', label: 'Leaf A1X' },
          { value: 'leaf-a1y', label: 'Leaf A1Y' }
        ]
      },
      { value: 'mid-a2', label: 'Mid A2' }
    ]
  },
  {
    value: 'root-b',
    label: 'Root B',
    children: [{ value: 'leaf-b1', label: 'Leaf B1' }]
  }
];

describe('buildFlatMap', () => {
  const map = buildFlatMap(FIXTURE_TREE);

  it('contains every node', () => {
    expect(map.size).toBe(7);
  });

  it('root node path is [rootLabel]', () => {
    expect(map.get('root-a')?.path).toEqual(['Root A']);
  });

  it('mid node path includes root and self', () => {
    expect(map.get('mid-a1')?.path).toEqual(['Root A', 'Mid A1']);
  });

  it('leaf node path includes all ancestors', () => {
    expect(map.get('leaf-a1x')?.path).toEqual(['Root A', 'Mid A1', 'Leaf A1X']);
  });

  it('stores correct label', () => {
    expect(map.get('leaf-b1')?.label).toBe('Leaf B1');
  });
});

describe('getDescendantValues', () => {
  it('returns all descendant values (not self)', () => {
    const node = FIXTURE_TREE[0];
    const result = getDescendantValues(node);
    expect(result).toEqual(
      expect.arrayContaining(['mid-a1', 'leaf-a1x', 'leaf-a1y', 'mid-a2'])
    );
    expect(result).not.toContain('root-a');
  });

  it('returns empty array for leaf node', () => {
    expect(getDescendantValues({ value: 'leaf-a1x', label: 'X' })).toEqual([]);
  });
});

describe('hasSelectedAncestor', () => {
  const map = buildFlatMap(FIXTURE_TREE);

  it('returns true when direct parent is selected', () => {
    expect(hasSelectedAncestor('mid-a1', ['root-a'], map)).toBe(true);
  });

  it('returns true when grandparent is selected', () => {
    expect(hasSelectedAncestor('leaf-a1x', ['root-a'], map)).toBe(true);
  });

  it('returns false when no ancestor is selected', () => {
    expect(hasSelectedAncestor('leaf-a1x', ['root-b'], map)).toBe(false);
  });

  it('returns false when self is selected but no ancestor', () => {
    expect(hasSelectedAncestor('leaf-a1x', ['leaf-a1x'], map)).toBe(false);
  });
});

describe('getIndeterminate', () => {
  const map = buildFlatMap(FIXTURE_TREE);

  it('returns true when a descendant (not self) is selected', () => {
    expect(getIndeterminate('root-a', ['leaf-a1x'], FIXTURE_TREE, map)).toBe(
      true
    );
  });

  it('returns false when self is selected', () => {
    expect(getIndeterminate('root-a', ['root-a'], FIXTURE_TREE, map)).toBe(
      false
    );
  });

  it('returns false when no descendant is selected', () => {
    expect(getIndeterminate('root-a', ['root-b'], FIXTURE_TREE, map)).toBe(
      false
    );
  });

  it('returns false for leaf node (no descendants)', () => {
    expect(getIndeterminate('leaf-a1x', ['leaf-a1x'], FIXTURE_TREE, map)).toBe(
      false
    );
  });
});

describe('filterNodes', () => {
  const map = buildFlatMap(FIXTURE_TREE);

  it('returns matching entries (case-insensitive)', () => {
    const results = filterNodes(map, 'leaf', FIXTURE_TREE);
    const values = results.map((r) => r.value);
    expect(values).toContain('leaf-a1x');
    expect(values).toContain('leaf-a1y');
    expect(values).toContain('leaf-b1');
  });

  it('matches by label substring', () => {
    const results = filterNodes(map, 'A1X', FIXTURE_TREE);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe('leaf-a1x');
  });

  it('returns empty array for no matches', () => {
    expect(filterNodes(map, 'zzz', FIXTURE_TREE)).toEqual([]);
  });

  it('is case-insensitive', () => {
    const lower = filterNodes(map, 'root a', FIXTURE_TREE);
    const upper = filterNodes(map, 'ROOT A', FIXTURE_TREE);
    expect(lower.map((r) => r.value)).toEqual(upper.map((r) => r.value));
  });
});

// ─── Component tests (Tasks 3–8) ────────────────────────────────────────────

const flatMap = buildFlatMap(FIXTURE_TREE);

function renderTreeSelect(value: string[] = [], onValueChange = vi.fn()) {
  return render(
    <TreeSelect
      value={value}
      onValueChange={onValueChange}
      flatMap={flatMap}
      tree={FIXTURE_TREE}
    >
      <TreeSelectTrigger placeholder="Select categories" />
      <TreeSelectContent>
        <TreeSelectGroup items={FIXTURE_TREE} />
      </TreeSelectContent>
    </TreeSelect>
  );
}

describe('TreeSelectTrigger', () => {
  it('shows placeholder when nothing selected', () => {
    renderTreeSelect([]);
    expect(screen.getByText('Select categories')).toBeInTheDocument();
  });

  it('renders one badge per selected value', () => {
    renderTreeSelect(['leaf-a1x', 'leaf-b1']);
    // path.slice(1).join(' > '): leaf-a1x path = ['Root A','Mid A1','Leaf A1X'] → 'Mid A1 > Leaf A1X'
    expect(screen.getByText('Mid A1 > Leaf A1X')).toBeInTheDocument();
    // leaf-b1 path = ['Root B','Leaf B1'] → 'Leaf B1'
    expect(screen.getByText('Leaf B1')).toBeInTheDocument();
  });

  it('shows just label for depth-1 node', () => {
    renderTreeSelect(['mid-a1']);
    // mid-a1 path = ['Root A','Mid A1'] → slice(1) = ['Mid A1']
    expect(screen.getByText('Mid A1')).toBeInTheDocument();
  });

  it('clicking × on badge removes that value', () => {
    const onChange = vi.fn();
    renderTreeSelect(['leaf-a1x', 'leaf-b1'], onChange);
    const badge = screen
      .getByText('Mid A1 > Leaf A1X')
      .closest('[data-testid="badge"]') as HTMLElement;
    fireEvent.click(within(badge).getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(['leaf-b1']);
  });

  it('clear button removes all values', () => {
    const onChange = vi.fn();
    renderTreeSelect(['leaf-a1x', 'leaf-b1'], onChange);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('TreeSelectGroup / TreeSelectItem', () => {
  it('renders only root-level nodes initially', async () => {
    renderTreeSelect([]);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByText('Root A')).toBeInTheDocument();
    expect(screen.getByText('Root B')).toBeInTheDocument();
    expect(screen.queryByText('Mid A1')).not.toBeInTheDocument();
  });

  it('clicking chevron expands a parent', () => {
    renderTreeSelect([]);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTestId('expand-root-a'));
    expect(screen.getByText('Mid A1')).toBeInTheDocument();
  });

  it('clicking chevron again collapses', () => {
    renderTreeSelect([]);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTestId('expand-root-a'));
    fireEvent.click(screen.getByTestId('expand-root-a'));
    expect(screen.queryByText('Mid A1')).not.toBeInTheDocument();
  });

  it('selecting a node calls onValueChange', () => {
    const onChange = vi.fn();
    renderTreeSelect([], onChange);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTestId('checkbox-root-b'));
    expect(onChange).toHaveBeenCalledWith(['root-b']);
  });

  it('selected node shows aria-checked=true', () => {
    renderTreeSelect(['root-b']);
    fireEvent.click(screen.getByRole('combobox'));
    const item = screen.getByTestId('item-root-b');
    expect(item).toHaveAttribute('aria-checked', 'true');
  });

  it('descendant of selected parent shows aria-checked=true and is disabled', () => {
    renderTreeSelect(['root-b']);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTestId('expand-root-b'));
    const leaf = screen.getByTestId('item-leaf-b1');
    expect(leaf).toHaveAttribute('aria-checked', 'true');
    expect(leaf).toHaveAttribute('aria-disabled', 'true');
  });

  it('partial child selection shows aria-checked=mixed on parent', () => {
    renderTreeSelect(['leaf-a1x']);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByTestId('item-root-a')).toHaveAttribute(
      'aria-checked',
      'mixed'
    );
  });

  it('selecting a parent removes all its descendant nodes from selection', () => {
    const onChange = vi.fn();
    // Start with children already selected
    renderTreeSelect(['leaf-a1x', 'leaf-a1y'], onChange);
    fireEvent.click(screen.getByRole('combobox'));
    // Select the mid-a1 parent (ancestor of leaf-a1x and leaf-a1y)
    fireEvent.click(screen.getByTestId('expand-root-a'));
    fireEvent.click(screen.getByTestId('checkbox-mid-a1'));
    // Expect descendants to be removed, and only mid-a1 to be selected
    expect(onChange).toHaveBeenCalledWith(['mid-a1']);
  });
});

describe('TreeSelectSearch', () => {
  it('filtering shows flat results with breadcrumb', () => {
    renderTreeSelect([]);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'Leaf A1' }
    });
    expect(screen.getByText('Root A > Mid A1 > Leaf A1X')).toBeInTheDocument();
    expect(screen.getByText('Root A > Mid A1 > Leaf A1Y')).toBeInTheDocument();
  });

  it('shows "No results found." for empty match', () => {
    renderTreeSelect([]);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'zzz' }
    });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
