'use client';

import React from 'react';
import { PopoverContent } from '@/components/shadcn/popover';
import { cn } from '@/lib/utils';
import { useTreeSelect } from './tree-select';
import { filterNodes } from './utils';
import { TreeSelectSearch } from './search';

interface TreeSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TreeSelectContent({
  children,
  className
}: TreeSelectContentProps) {
  const { searchQuery, flatMap, tree, selectedValues, toggleValue } =
    useTreeSelect();

  const searchResults = searchQuery
    ? filterNodes(flatMap, searchQuery, tree)
    : [];

  return (
    <PopoverContent
      align="start"
      className={cn(
        'w-[--radix-popover-trigger-width] p-0 flex flex-col overflow-hidden bg-popover text-popover-foreground border shadow-md rounded-md',
        className
      )}
      // Stop Radix or Dialog from interfering with scrolling
      onWheel={(e) => e.stopPropagation()}
      onEscapeKeyDown={() => void 0}
    >
      {/* Search area */}
      <TreeSelectSearch />

      {/* Main scrollable area */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain min-h-0 max-h-[400px] py-1 scrollbar-thin"
        // Ensure mouse wheel events stay here and don't bubble to Dialog/Body
        onWheel={(e) => e.stopPropagation()}
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
                  role="option"
                  aria-selected={selectedValues.includes(result.value)}
                  tabIndex={0}
                  onClick={() =>
                    toggleValue(result.value, {
                      value: result.value,
                      label: result.label,
                      children: result.children
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleValue(result.value, {
                        value: result.value,
                        label: result.label,
                        children: result.children
                      });
                    }
                  }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-medium">{result.label}</span>
                    <span className="text-muted-foreground text-[10px] leading-tight">
                      {result.path.join(' > ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="contents">{children}</div>
        )}
      </div>
    </PopoverContent>
  );
}
