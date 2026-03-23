import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Command as CommandPrimitive } from 'cmdk';
import { Search, Star, X } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFilter, setMobileFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: keywordPage } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      pageSize: 100,
      orderby: 'desc',
      orderByField: 'updatedAt',
      hasResults: true
    })
  );

  const rawKeywords = keywordPage?.data ?? [];
  const sorted = [...rawKeywords].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.keyword.localeCompare(b.keyword);
  });
  const filtered = filterText
    ? sorted.filter((k) =>
        k.keyword.toLowerCase().includes(filterText.toLowerCase())
      )
    : sorted;
  const mobileFiltered = mobileFilter
    ? sorted.filter((k) =>
        k.keyword.toLowerCase().includes(mobileFilter.toLowerCase())
      )
    : sorted;

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

  const handleMobileSelect = (keyword: string) => {
    setMobileOpen(false);
    navigate({
      to: '/search',
      search: { keywords: encodeURIComponent(keyword) }
    });
  };

  const handleClear = () => {
    setFilterText('');
    setSelected(null);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: tap to open dialog */}
      <button
        className={cn(
          'md:hidden flex items-center gap-2 w-full border rounded-md px-3 h-9 bg-background text-sm',
          className
        )}
        onClick={() => setMobileOpen(true)}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            'flex-1 text-left truncate',
            selected ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {selected ?? 'Search keywords…'}
        </span>
        {selected && (
          <X
            className="size-4 shrink-0 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(null);
              setFilterText('');
            }}
          />
        )}
      </button>

      <CommandDialog
        open={mobileOpen}
        onOpenChange={(v) => {
          setMobileOpen(v);
          if (!v) setMobileFilter('');
        }}
        title="Search keywords"
        description="Select a keyword to search"
        showCloseButton={false}
        className="h-[420px]"
      >
        <CommandInput
          value={mobileFilter}
          onValueChange={setMobileFilter}
          placeholder="Search keywords…"
        />
        <CommandList className="max-h-none flex-1">
          <CommandEmpty>No keywords found</CommandEmpty>
          {mobileFiltered.map((k) => (
            <CommandItem
              key={k.id}
              value={k.keyword}
              onSelect={handleMobileSelect}
            >
              {k.keyword}
              {k.pinned && (
                <Star
                  className="size-3 text-yellow-400 shrink-0"
                  fill="currentColor"
                />
              )}
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Desktop: inline input with dropdown */}
      <CommandPrimitive
        ref={containerRef}
        shouldFilter={false}
        className={cn('relative hidden md:block', className)}
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
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
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
                <CommandItem
                  key={k.id}
                  value={k.keyword}
                  onSelect={handleSelect}
                >
                  {k.keyword}
                  {k.pinned && (
                    <Star
                      className="size-3 text-yellow-400 shrink-0"
                      fill="currentColor"
                    />
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </div>
        )}
      </CommandPrimitive>
    </>
  );
}
