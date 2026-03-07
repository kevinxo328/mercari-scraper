'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Command as CommandPrimitive } from 'cmdk';
import { Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  CommandEmpty,
  CommandItem,
  CommandList
} from '@/components/shadcn/command';
import { cn } from '@/lib/utils';
import { trpc } from '@/router';

export default function KeywordSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: keywordPage } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      pageSize: 100,
      orderby: 'desc',
      orderByField: 'updatedAt',
      hasResults: true
    })
  );

  const keywords = keywordPage?.data ?? [];
  const filtered = filterText
    ? keywords.filter((k) =>
        k.keyword.toLowerCase().includes(filterText.toLowerCase())
      )
    : keywords;

  const search = (keyword?: string) => {
    const target = keyword ?? selected;
    if (target) {
      navigate({
        to: '/search',
        search: {
          keywords: encodeURIComponent(target)
        }
      });
    } else {
      navigate({
        to: '/search'
      });
    }
    setOpen(false);
  };

  const handleSelect = (keyword: string) => {
    setSelected(keyword);
    setFilterText(keyword);
    search(keyword);
  };

  const handleClear = () => {
    setFilterText('');
    setSelected(null);
    setOpen(false);
  };

  return (
    <CommandPrimitive
      ref={containerRef}
      shouldFilter={false}
      className={cn('relative', className)}
    >
      <div className="flex items-center gap-1 border rounded-md px-2 bg-background h-9">
        <CommandPrimitive.Input
          value={filterText}
          onValueChange={(v) => {
            setFilterText(v);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Search keywords…"
          className="flex-1 bg-transparent text-base md:text-sm outline-none placeholder:text-muted-foreground min-w-0"
        />
        {filterText && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => search()}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Search"
        >
          <Search className="size-4" />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md overscroll-contain">
          <CommandList>
            <CommandEmpty>No keywords found</CommandEmpty>
            {filtered.map((k) => (
              <CommandItem key={k.id} value={k.keyword} onSelect={handleSelect}>
                {k.keyword}
              </CommandItem>
            ))}
          </CommandList>
        </div>
      )}
    </CommandPrimitive>
  );
}
