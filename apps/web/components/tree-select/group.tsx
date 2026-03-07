'use client';

import React from 'react';

import { TreeSelectItem } from './item';
import { useTreeSelect } from './tree-select';
import { TreeNode } from './types';

interface TreeSelectGroupProps {
  items: TreeNode[];
  depth?: number;
}

export function TreeSelectGroup({ items, depth = 0 }: TreeSelectGroupProps) {
  const { expandedValues } = useTreeSelect();

  return (
    <div role={depth === 0 ? 'tree' : 'group'}>
      {items.map((node) => {
        const isExpanded = expandedValues.has(node.value);
        return (
          <React.Fragment key={node.value}>
            <TreeSelectItem node={node} depth={depth} allNodes={items} />
            {node.children?.length && isExpanded ? (
              <TreeSelectGroup items={node.children} depth={depth + 1} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
