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
  const { searchQuery, flatMap, selectedValues, toggleValue } = useTreeSelect();

  const searchResults = searchQuery ? filterNodes(flatMap, searchQuery) : [];

  return (
    <PopoverContent
      align="start"
      className={cn('w-[--radix-popover-trigger-width] p-0', className)}
      onEscapeKeyDown={() => void 0}
    >
      {/* Search input — always visible, never scrolls */}
      <div className="border-b">
        <TreeSelectSearch />
      </div>

      {/* Scrollable list area */}
      <div
        style={{ maxHeight: '300px', overflowY: 'auto' }}
        className="overscroll-contain"
      >
        {searchQuery ? (
          <div role="listbox" aria-label="Search results" className="py-1">
            {searchResults.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No results found.
              </p>
            ) : (
              searchResults.map((result) => {
                const isSelected = selectedValues.includes(result.value);
                return (
                  <div
                    key={result.value}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() =>
                      toggleValue(result.value, {
                        value: result.value,
                        label: result.label
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleValue(result.value, {
                          value: result.value,
                          label: result.label
                        });
                      }
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer select-none"
                  >
                    <span className="text-muted-foreground text-xs">
                      {result.path.join(' > ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="py-1">{children}</div>
        )}
      </div>
    </PopoverContent>
  );
}
