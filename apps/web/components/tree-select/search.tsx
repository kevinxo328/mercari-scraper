'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/shadcn/input';
import { useTreeSelect } from './tree-select';

export function TreeSelectSearch() {
  const { searchQuery, setSearchQuery } = useTreeSelect();

  return (
    <div className="flex items-center border-b px-3 py-2 gap-2">
      <Search className="size-4 text-muted-foreground shrink-0" />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
