'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { memo } from 'react';

import { Checkbox } from '@/components/shadcn/checkbox';
import { cn } from '@/lib/utils';

import { useTreeSelect } from './tree-select';
import { TreeNode } from './types';
import {
  getDescendantValues,
  getIndeterminate,
  hasSelectedAncestor
} from './utils';

interface TreeSelectItemProps {
  node: TreeNode;
  depth: number;
  allNodes: TreeNode[];
}

export const TreeSelectItem = memo(function TreeSelectItem({
  node,
  depth,
  allNodes
}: TreeSelectItemProps) {
  const {
    selectedValues,
    toggleValue,
    expandedValues,
    toggleExpanded,
    flatMap,
    focusedValue,
    setFocusedValue
  } = useTreeSelect();

  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedValues.has(node.value);
  const isFocused = focusedValue === node.value;
  const isDirectlySelected = selectedValues.includes(node.value);
  const isInherited =
    !isDirectlySelected &&
    hasSelectedAncestor(node.value, selectedValues, flatMap);
  const isIndeterminate =
    !isDirectlySelected &&
    !isInherited &&
    getIndeterminate(node.value, selectedValues, allNodes, flatMap);

  const isChecked = isDirectlySelected || isInherited;
  const isDisabled = isInherited;

  const ariaChecked = isIndeterminate ? 'mixed' : isChecked ? 'true' : 'false';

  const handleCheckboxClick = () => {
    if (isDisabled) return;
    toggleValue(node.value, node);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(node.value);
  };

  // When selecting a parent, also ensure descendants are not individually stored
  // (parent takes precedence — handled in TreeSelect.toggleValue)
  void getDescendantValues;

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-checked={ariaChecked}
      aria-level={depth + 1}
      aria-disabled={isDisabled ? 'true' : undefined}
      data-testid={`item-${node.value}`}
      data-value={node.value}
      onMouseEnter={() => setFocusedValue(node.value)}
      className={cn(
        'flex items-center gap-1 py-1 px-2 rounded-sm cursor-pointer select-none',
        'hover:bg-accent hover:text-accent-foreground',
        isFocused && 'bg-accent text-accent-foreground',
        isDisabled && 'opacity-60 cursor-default'
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <button
        type="button"
        data-testid={`expand-${node.value}`}
        onClick={handleChevronClick}
        className={cn(
          'size-4 flex items-center justify-center shrink-0 text-muted-foreground',
          !hasChildren && 'invisible'
        )}
        tabIndex={-1}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {isExpanded ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
      </button>

      <Checkbox
        checked={isIndeterminate ? 'indeterminate' : isChecked}
        onCheckedChange={handleCheckboxClick}
        disabled={isDisabled}
        data-testid={`checkbox-${node.value}`}
        aria-hidden="true"
        tabIndex={-1}
        className="shrink-0"
      />

      <span className="text-sm truncate flex-1">{node.label}</span>
    </div>
  );
});
