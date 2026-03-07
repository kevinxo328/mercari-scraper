'use client';

import { Search } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/shadcn/input';

import { useTreeSelect } from './tree-select';

export function TreeSelectSearch() {
  const { searchQuery, setSearchQuery } = useTreeSelect();

  return (
    <div className="flex items-center border-b px-3 h-9 gap-2 shrink-0">
      <Search className="size-4 text-muted-foreground shrink-0" />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="border-0 p-0 h-full text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
      />
    </div>
  );
}
