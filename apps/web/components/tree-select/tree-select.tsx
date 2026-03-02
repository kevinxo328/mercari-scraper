'use client';

import React, { createContext, useContext, useState } from 'react';
import { Popover } from '@/components/shadcn/popover';
import { FlatMapEntry, TreeNode, TreeSelectContextValue } from './types';
import { getDescendantValues } from './utils';

export const TreeSelectContext = createContext<TreeSelectContextValue | null>(
  null
);

export function useTreeSelect(): TreeSelectContextValue {
  const ctx = useContext(TreeSelectContext);
  if (!ctx) throw new Error('useTreeSelect must be used inside <TreeSelect>');
  return ctx;
}

export interface TreeSelectProps {
  value: string[];
  onValueChange: (values: string[]) => void;
  flatMap: Map<string, FlatMapEntry>;
  tree?: TreeNode[]; // original tree for traversing descendants
  children: React.ReactNode;
}

export function TreeSelect({
  value,
  onValueChange,
  flatMap,
  tree = [],
  children
}: TreeSelectProps) {
  const [expandedValues, setExpandedValues] = useState<Set<string>>(
    () => new Set()
  );
  const [searchQuery, setSearchQueryState] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (nodeValue: string, node: TreeNode) => {
    const isRemoving = value.includes(nodeValue);

    if (isRemoving) {
      onValueChange(value.filter((v) => v !== nodeValue));
    } else {
      // When adding a node, remove all its descendants from the selection
      // because parent selection implies descendant selection.
      const descendants = getDescendantValues(node);
      const newValue = value.filter((v) => !descendants.includes(v));
      onValueChange([...newValue, nodeValue]);
    }
  };

  const clearAll = () => onValueChange([]);

  const toggleExpanded = (nodeValue: string) => {
    setExpandedValues((prev) => {
      const next = new Set(prev);
      next.has(nodeValue) ? next.delete(nodeValue) : next.add(nodeValue);
      return next;
    });
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (query) {
      setExpandedValues(() => new Set());
    }
  };

  const ctx: TreeSelectContextValue = {
    selectedValues: value,
    toggleValue,
    clearAll,
    expandedValues,
    toggleExpanded,
    searchQuery,
    setSearchQuery,
    flatMap,
    tree,
    isOpen,
    setIsOpen
  };

  return (
    <TreeSelectContext.Provider value={ctx}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Popover>
    </TreeSelectContext.Provider>
  );
}
