/* eslint-env browser */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  PlusIcon,
  Star,
  Tag,
  Trash2,
  XIcon
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/router';
import { ScraperKeyword } from '@/types/scraper';

import AddKeywordDialog from '../dialogs/add-keyword-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../shadcn/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../shadcn/tooltip';

type SortableField = 'keyword' | 'createdAt';

const PAGE_SIZES = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 500;

const SORTABLE_COLUMNS: {
  key: SortableField;
  label: string;
}[] = [
  { key: 'keyword', label: 'Keyword' },
  { key: 'createdAt', label: 'Created' }
];

const SKELETON_ROW_COUNT = 5;
const UNDO_DURATION_MS = 5000;

const formatDate = (date: Date | string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return 'N/A';
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPriceRange = (min: number | null, max: number | null): string => {
  if (min === null && max === null) return '—';
  if (min !== null && max !== null)
    return `${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (min !== null) return `≥ ${min.toLocaleString()}`;
  return `≤ ${max!.toLocaleString()}`;
};

export default function KeywordTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortableField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    new Set()
  );
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [keywordToEdit, setKeywordToEdit] = useState<ScraperKeyword | null>(
    null
  );

  const keywordQueryOptions = trpc.scraper.getKeywords.queryOptions({
    page,
    pageSize,
    orderby: sortOrder,
    orderByField: sortField,
    search: searchTerm || undefined
  });

  const {
    data: keywordsData,
    isPending,
    isFetching,
    isError,
    error
  } = useQuery(keywordQueryOptions);

  const deleteMutation = useMutation(
    trpc.scraper.deleteKeyword.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.scraper.getKeywords.pathFilter()
        );
      }
    })
  );

  const pinMutation = useMutation(
    trpc.scraper.pinKeyword.mutationOptions({
      onMutate: async ({ id, pinned }) => {
        await queryClient.cancelQueries(trpc.scraper.getKeywords.pathFilter());
        const previousData = queryClient.getQueriesData(
          trpc.scraper.getKeywords.pathFilter()
        );
        queryClient.setQueriesData(
          trpc.scraper.getKeywords.pathFilter(),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((kw: ScraperKeyword) =>
                kw.id === id ? { ...kw, pinned } : kw
              )
            };
          }
        );
        return { previousData };
      },
      onError: (_err, _vars, context: any) => {
        if (context?.previousData) {
          for (const [queryKey, data] of context.previousData) {
            queryClient.setQueryData(queryKey, data);
          }
        }
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(
          trpc.scraper.getKeywords.pathFilter()
        );
      }
    })
  );

  const keywords = keywordsData?.data ?? [];
  const total = keywordsData?.total ?? 0;
  const totalPages =
    keywordsData?.pageSize && keywordsData.pageSize > 0
      ? Math.max(1, Math.ceil(total / keywordsData.pageSize))
      : 1;

  useEffect(() => {
    if (keywordsData && page > totalPages) {
      setPage(totalPages);
    }
  }, [keywordsData, page, totalPages]);

  useEffect(() => {
    return () => {
      for (const timer of deleteTimers.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const trimmedSearchValue = searchInput.trim();

  useEffect(() => {
    if (isComposing) return;
    if (trimmedSearchValue === searchTerm) return;

    const handler = setTimeout(() => {
      setSearchTerm(trimmedSearchValue);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [isComposing, trimmedSearchValue, searchTerm]);

  const handleEdit = useCallback((keyword: ScraperKeyword) => {
    setKeywordToEdit(keyword);
    setEditDialogOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  }, []);

  const handleUndoDelete = useCallback((id: string) => {
    const timer = deleteTimers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      deleteTimers.current.delete(id);
    }
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    (keyword: ScraperKeyword) => {
      const existing = deleteTimers.current.get(keyword.id);
      if (existing !== undefined) clearTimeout(existing);
      setPendingDeleteIds((prev) => new Set(prev).add(keyword.id));
      toast(`"${keyword.keyword}" deleted`, {
        action: { label: 'Undo', onClick: () => handleUndoDelete(keyword.id) },
        duration: UNDO_DURATION_MS
      });
      const timer = setTimeout(() => {
        deleteTimers.current.delete(keyword.id);
        deleteMutation.mutate(
          { id: keyword.id },
          {
            // Clean up the pending set regardless of success/error,
            // since the item no longer exists in the backend after this point.
            onSettled: () =>
              setPendingDeleteIds((prev) => {
                const next = new Set(prev);
                next.delete(keyword.id);
                return next;
              })
          }
        );
      }, UNDO_DURATION_MS);
      deleteTimers.current.set(keyword.id, timer);
    },
    [deleteMutation, handleUndoDelete]
  );

  const displayedKeywords = useMemo(
    () => keywords.filter((kw) => !pendingDeleteIds.has(kw.id)),
    [keywords, pendingDeleteIds]
  );

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const columns = useMemo<ColumnDef<ScraperKeyword>[]>(
    () => [
      {
        accessorKey: 'keyword',
        header: () => (
          <div className="flex items-center gap-1">
            Keyword
            {sortField === 'keyword' &&
              (sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3 shrink-0" />
              ) : (
                <ArrowDown className="h-3 w-3 shrink-0" />
              ))}
          </div>
        ),
        cell: ({ row }) => {
          const keyword = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={keyword.pinned ? 'Unpin' : 'Pin'}
                onClick={() =>
                  pinMutation.mutate({
                    id: keyword.id,
                    pinned: !keyword.pinned
                  })
                }
                className={`disabled:opacity-40 shrink-0 ${keyword.pinned ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                disabled={pinMutation.isPending}
              >
                <Star
                  className="h-4 w-4"
                  fill={keyword.pinned ? 'currentColor' : 'none'}
                />
              </button>
              <span className="font-medium">{keyword.keyword}</span>
            </div>
          );
        },
        meta: {
          className:
            'sticky left-0 bg-white dark:bg-gray-950 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]'
        }
      },
      {
        id: 'priceRange',
        header: () => <div className="text-right">Price Range</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-sm">
            {formatPriceRange(row.original.minPrice, row.original.maxPrice)}
          </div>
        )
      },
      {
        accessorKey: 'categoryNames',
        header: () => <span>Categories</span>,
        cell: ({ row }) => {
          const keyword = row.original;
          const MAX_VISIBLE = 2;
          const visible = keyword.categoryNames.slice(0, MAX_VISIBLE);
          const hidden = keyword.categoryNames.slice(MAX_VISIBLE);
          return keyword.categoryNames.length > 0 ? (
            <div className="flex flex-wrap gap-1 text-xs">
              {visible.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {name}
                </span>
              ))}
              {hidden.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default rounded-full bg-gray-200 px-2 py-0.5 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      +{hidden.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      {hidden.map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: () => (
          <div className="flex items-center gap-1">
            Created
            {sortField === 'createdAt' &&
              (sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3 shrink-0" />
              ) : (
                <ArrowDown className="h-3 w-3 shrink-0" />
              ))}
          </div>
        ),
        cell: ({ row }) => formatDate(row.original.createdAt)
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const keyword = row.original;

          return (
            <div className="flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(keyword)}
                    aria-label="Edit"
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(keyword)}
                    aria-label="Delete"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          );
        },
        meta: {
          className:
            'sticky right-0 bg-white dark:bg-gray-950 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_4px_rgba(0,0,0,0.3)]'
        }
      }
    ],
    [sortField, sortOrder, pinMutation, handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: displayedKeywords,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div>
      <div
        className="sticky z-20 bg-white dark:bg-gray-950 border-b"
        style={{ top: 'var(--header-height, 64px)' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search keywords"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(event) => {
                  setIsComposing(false);
                  setSearchInput(event.currentTarget.value);
                }}
                className="w-full pr-10"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-2 my-auto h-6 w-6"
                  onClick={handleClearSearch}
                >
                  <XIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 sm:contents">
              <div className="flex items-center gap-2 shrink-0 text-sm text-gray-500">
                <span className="hidden sm:inline">Sort by</span>
                <Select
                  value={sortField}
                  onValueChange={(value) =>
                    setSortField(value as SortableField)
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTABLE_COLUMNS.map((column) => (
                      <SelectItem key={column.key} value={column.key}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === 'asc' ? 'desc' : 'asc'
                        )
                      }
                      aria-label={
                        sortOrder === 'asc' ? 'Ascending' : 'Descending'
                      }
                    >
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </TooltipContent>
                </Tooltip>
              </div>
              <AddKeywordDialog>
                <Button className="shrink-0">
                  <PlusIcon className="h-4 w-4" />
                  Add Keyword
                </Button>
              </AddKeywordDialog>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Mobile card list */}
        <div
          className={cn(
            'block sm:hidden space-y-3 transition-opacity duration-200',
            isFetching && !isPending && 'opacity-60'
          )}
        >
          {isPending ? (
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-32 flex-1" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))
          ) : isError ? (
            <div className="rounded-lg border border-red-200 dark:border-red-900 p-8 text-center text-sm text-red-500">
              Failed to load keywords:{' '}
              {error instanceof Error ? error.message : ''}
            </div>
          ) : displayedKeywords.length > 0 ? (
            displayedKeywords.map((keyword) => {
              const MAX_VISIBLE = 2;
              const visibleCats = keyword.categoryNames.slice(0, MAX_VISIBLE);
              const hiddenCats = keyword.categoryNames.slice(MAX_VISIBLE);
              return (
                <div
                  key={keyword.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={keyword.pinned ? 'Unpin' : 'Pin'}
                      onClick={() =>
                        pinMutation.mutate({
                          id: keyword.id,
                          pinned: !keyword.pinned
                        })
                      }
                      disabled={pinMutation.isPending}
                      className={`shrink-0 disabled:opacity-40 ${keyword.pinned ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star
                        className="h-5 w-5"
                        fill={keyword.pinned ? 'currentColor' : 'none'}
                      />
                    </button>
                    <span className="flex-1 font-medium">
                      {keyword.keyword}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(keyword)}
                        aria-label="Edit"
                        className="h-10 w-10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(keyword)}
                        aria-label="Delete"
                        className="h-10 w-10 text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="tabular-nums">
                      {formatPriceRange(keyword.minPrice, keyword.maxPrice)}
                    </span>
                    <span>·</span>
                    <span>{formatDate(keyword.createdAt)}</span>
                  </div>
                  {keyword.categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-xs">
                      {visibleCats.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {name}
                        </span>
                      ))}
                      {hiddenCats.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default rounded-full bg-gray-200 px-2 py-0.5 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                              +{hiddenCats.length}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              {hiddenCats.map((name) => (
                                <span key={name}>{name}</span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 py-16">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Tag className="h-8 w-8 opacity-40" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {searchTerm
                      ? 'No keywords match your search'
                      : 'No keywords yet'}
                  </p>
                  {!searchTerm && (
                    <p className="mt-1 text-xs">
                      Add a keyword to start tracking Mercari listings.
                    </p>
                  )}
                </div>
                {searchTerm && (
                  <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div
          className={cn(
            'hidden sm:block overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800 transition-opacity duration-200',
            isFetching && !isPending && 'opacity-60'
          )}
        >
          <Table className="min-w-[560px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | { className?: string }
                      | undefined;
                    return (
                      <TableHead
                        key={header.id}
                        className={`align-middle ${meta?.className || ''}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="sticky left-0 bg-white dark:bg-gray-950 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white dark:bg-gray-950 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_4px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-red-500"
                  >
                    Failed to load keywords:{' '}
                    {error instanceof Error ? error.message : ''}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { className?: string }
                        | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={`align-middle ${meta?.className || ''}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Tag className="h-8 w-8 opacity-40" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">
                          {searchTerm
                            ? 'No keywords match your search'
                            : 'No keywords yet'}
                        </p>
                        {!searchTerm && (
                          <p className="mt-1 text-xs">
                            Add a keyword to start tracking Mercari listings.
                          </p>
                        )}
                      </div>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSearch}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Rows per page</label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-500">
              {total > 0
                ? `${rangeStart}–${rangeEnd} of ${total}`
                : `Page ${page} of ${totalPages}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
        <AddKeywordDialog
          keywordToEdit={keywordToEdit ?? undefined}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setKeywordToEdit(null);
            }
          }}
        />
      </div>
    </div>
  );
}
