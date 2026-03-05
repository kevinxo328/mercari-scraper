// Unit tests for getCategories transformation logic.
// We test the DFS builder functions directly rather than the tRPC router to avoid
// bootstrapping the full tRPC/Prisma context in Jest.

import { buildFlatMap } from '@/components/tree-select/utils';
import type { TreeNode } from '@/components/tree-select/types';

// Minimal fixture that mirrors the raw mercari-categories.json shape
const RAW_TREE = [
  {
    code: '10',
    name: 'ファッション',
    enName: '',
    children: [
      {
        code: '11',
        name: 'レディース',
        enName: 'Ladieswear',
        children: [
          {
            code: '12',
            name: 'トップス',
            enName: '',
            children: []
          }
        ]
      }
    ]
  }
];

// Mirror the transformation that getCategories will apply
function toTreeNode(raw: {
  code: string;
  name: string;
  enName: string;
  children?: typeof RAW_TREE;
}): TreeNode {
  return {
    value: raw.code,
    label: raw.enName || raw.name,
    children: raw.children?.map(toTreeNode)
  };
}

describe('getCategories transformation', () => {
  const tree = RAW_TREE.map(toTreeNode);

  it('maps code to value', () => {
    expect(tree[0].value).toBe('10');
  });

  it('prefers enName over name when enName is non-empty', () => {
    expect(tree[0].children![0].label).toBe('Ladieswear');
  });

  it('falls back to name when enName is empty', () => {
    expect(tree[0].label).toBe('ファッション');
  });

  it('produces a flat map with all nodes', () => {
    const map = buildFlatMap(tree);
    expect(map.size).toBe(3); // root + mid + leaf
  });

  it('flat map entry has correct path for leaf', () => {
    const map = buildFlatMap(tree);
    expect(map.get('12')?.path).toEqual([
      'ファッション',
      'Ladieswear',
      'トップス'
    ]);
  });
});
