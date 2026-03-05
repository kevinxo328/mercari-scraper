'use client';

import React, { useRef, useEffect } from 'react';
import { PopoverContent } from '@/components/shadcn/popover';
import { cn } from '@/lib/utils';
import { useTreeSelect } from './tree-select';
import { filterNodes, getVisibleNodes, findNode } from './utils';
import { TreeSelectSearch } from './search';

interface TreeSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TreeSelectContent({
  children,
  className
}: TreeSelectContentProps) {
  const {
    searchQuery,
    flatMap,
    tree,
    selectedValues,
    toggleValue,
    focusedValue,
    setFocusedValue,
    expandedValues,
    toggleExpanded
  } = useTreeSelect();

  const scrollRef = useRef<HTMLDivElement>(null);

  const searchResults = searchQuery
    ? filterNodes(flatMap, searchQuery, tree)
    : [];

  const visibleNodes = searchQuery
    ? searchResults.map((r) => ({
        value: r.value,
        label: r.label,
        children: r.children
      }))
    : getVisibleNodes(tree, expandedValues);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (visibleNodes.length === 0) return;

    const currentIndex = focusedValue
      ? visibleNodes.findIndex((n) => n.value === focusedValue)
      : -1;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % visibleNodes.length;
        setFocusedValue(visibleNodes[nextIndex].value);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex =
          currentIndex <= 0 ? visibleNodes.length - 1 : currentIndex - 1;
        setFocusedValue(visibleNodes[prevIndex].value);
        break;
      }
      case 'ArrowRight': {
        if (!searchQuery && focusedValue) {
          const node = findNode(focusedValue, tree);
          if (node?.children?.length && !expandedValues.has(focusedValue)) {
            e.preventDefault();
            toggleExpanded(focusedValue);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (!searchQuery && focusedValue) {
          const node = findNode(focusedValue, tree);
          if (node?.children?.length && expandedValues.has(focusedValue)) {
            e.preventDefault();
            toggleExpanded(focusedValue);
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        if (focusedValue) {
          e.preventDefault();
          const node = findNode(focusedValue, tree);
          if (node) {
            toggleValue(focusedValue, node);
          }
        }
        break;
      }
    }
  };

  useEffect(() => {
    if (focusedValue && scrollRef.current) {
      const focusedElement = scrollRef.current.querySelector(
        `[data-value="${focusedValue}"]`
      );
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedValue]);

  return (
    <PopoverContent
      align="start"
      className={cn(
        'w-[--radix-popover-trigger-width] p-0 flex flex-col overflow-hidden bg-popover text-popover-foreground border shadow-md rounded-md max-h-[var(--radix-popover-content-available-height)]',
        className
      )}
      onWheel={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      onEscapeKeyDown={() => void 0}
    >
      <TreeSelectSearch />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain min-h-0 max-h-[min(400px,var(--radix-popover-content-available-height)-5rem)] py-1 scrollbar-thin outline-none"
        onWheel={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {searchQuery ? (
          <div role="listbox" aria-label="Search results">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Search Results
            </div>
            {searchResults.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.value}
                  data-value={result.value}
                  role="option"
                  aria-selected={selectedValues.includes(result.value)}
                  tabIndex={focusedValue === result.value ? 0 : -1}
                  onClick={() =>
                    toggleValue(result.value, {
                      value: result.value,
                      label: result.label,
                      children: result.children
                    })
                  }
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    focusedValue === result.value &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-medium">
                      {result.label}
                    </span>
                    <span className="text-muted-foreground text-[10px] leading-tight">
                      {result.path.join(' > ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div role="tree" aria-label="Category tree" className="contents">
            {children}
          </div>
        )}
      </div>
    </PopoverContent>
  );
}
