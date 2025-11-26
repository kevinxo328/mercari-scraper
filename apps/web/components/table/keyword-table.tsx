'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useTRPC } from '@/trpc/client';
import { XIcon, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table';
import { ScraperKeyword } from '@/types/scraper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../shadcn/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../shadcn/tooltip';
import AddKeywordDialog from '../dialog/add-keyword-dialog';

type SortableField =
  | 'keyword'
  | 'createdAt'
  | 'updatedAt'
  | 'minPrice'
  | 'maxPrice';

const PAGE_SIZES = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 500;

const SORTABLE_COLUMNS: {
  key: SortableField;
  label: string;
}[] = [
  { key: 'keyword', label: 'Keyword' },
  { key: 'minPrice', label: 'Min Price' },
  { key: 'maxPrice', label: 'Max Price' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' }
];

const formatDate = (date: Date | string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return 'N/A';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPrice = (value: number | null) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
};

export default function KeywordTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortableField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const togglePinMutation = useMutation(
    trpc.scraper.togglePinKeyword.mutationOptions({
      onSuccess: async () => {
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

  const trimmedSearchValue = searchInput.trim();

  useEffect(() => {
    if (isComposing) return;
    if (trimmedSearchValue === searchTerm) return;

    const handler = window.setTimeout(() => {
      setSearchTerm(trimmedSearchValue);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handler);
    };
  }, [isComposing, trimmedSearchValue, searchTerm]);

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (keyword: ScraperKeyword) => {
    setKeywordToEdit(keyword);
    setEditDialogOpen(true);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleDelete = (keyword: ScraperKeyword) => {
    if (
      !window.confirm(`Delete "${keyword.keyword}"? This cannot be undone.`)
    ) {
      return;
    }
    setDeletingId(keyword.id);
    deleteMutation.mutate(
      { id: keyword.id },
      {
        onSettled: () => setDeletingId(null)
      }
    );
  };

  const handleTogglePin = (keyword: ScraperKeyword) => {
    togglePinMutation.mutate({
      id: keyword.id,
      isPinned: !keyword.isPinned
    });
  };

  const isDeleting = deleteMutation.isPending;

  const columns: ColumnDef<ScraperKeyword>[] = [
    {
      accessorKey: 'keyword',
      header: () => (
        <button
          type="button"
          onClick={() => handleSort('keyword')}
          className="flex w-full items-center gap-1"
        >
          Keyword
          {sortField === 'keyword' && (
            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.keyword}</span>
      ),
      meta: {
        className:
          'sticky left-0 bg-white dark:bg-gray-950 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]'
      }
    },
    {
      id: 'pin',
      header: () => <div className="text-center">Pin</div>,
      cell: ({ row }) => {
        const keyword = row.original;
        const isPinning = togglePinMutation.isPending;

        return (
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleTogglePin(keyword)}
                  disabled={isPinning}
                  aria-label={keyword.isPinned ? 'Unpin' : 'Pin'}
                  className="h-8 w-8"
                >
                  <Star
                    className={`h-4 w-4 ${
                      keyword.isPinned
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {keyword.isPinned ? 'Unpin from homepage' : 'Pin to homepage'}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      }
    },
    {
      accessorKey: 'minPrice',
      header: () => (
        <button
          type="button"
          onClick={() => handleSort('minPrice')}
          className="flex w-full items-center justify-end gap-1"
        >
          Min Price
          {sortField === 'minPrice' && (
            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right">{formatPrice(row.original.minPrice)}</div>
      )
    },
    {
      accessorKey: 'maxPrice',
      header: () => (
        <button
          type="button"
          onClick={() => handleSort('maxPrice')}
          className="flex w-full items-center justify-end gap-1"
        >
          Max Price
          {sortField === 'maxPrice' && (
            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right">{formatPrice(row.original.maxPrice)}</div>
      )
    },
    {
      accessorKey: 'categoryNames',
      header: () => <span>Categories</span>,
      cell: ({ row }) => {
        const keyword = row.original;
        return keyword.categoryNames.length > 0 ? (
          <div className="flex flex-wrap gap-1 text-xs">
            {keyword.categoryNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">No categories</span>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <button
          type="button"
          onClick={() => handleSort('createdAt')}
          className="flex w-full items-center gap-1"
        >
          Created
          {sortField === 'createdAt' && (
            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      ),
      cell: ({ row }) => formatDate(row.original.createdAt)
    },
    {
      accessorKey: 'updatedAt',
      header: () => (
        <button
          type="button"
          onClick={() => handleSort('updatedAt')}
          className="flex w-full items-center gap-1"
        >
          Updated
          {sortField === 'updatedAt' && (
            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      ),
      cell: ({ row }) => formatDate(row.original.updatedAt)
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const keyword = row.original;
        const isRowDeleting = deletingId === keyword.id && isDeleting;

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleEdit(keyword)}
                  disabled={isRowDeleting}
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
                  variant="destructive"
                  onClick={() => handleDelete(keyword)}
                  disabled={isRowDeleting}
                  aria-label="Delete"
                  className="h-8 w-8"
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
  ];

  const table = useReactTable({
    data: keywords,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <section className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
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
        </div>
      </div>
      <div className="flex flex-wrap justify-end items-center gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Sort by</span>
          <Select
            value={sortField}
            onValueChange={(value) => setSortField(value as SortableField)}
          >
            <SelectTrigger className="w-[150px]" size="sm">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
            className="px-3 py-1"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
        <Table className="min-w-[900px]">
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
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
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
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-gray-500"
                >
                  No keywords found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* <TableCaption>{isFetching && 'Refreshing data...'}</TableCaption> */}
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
            Page {page} of {totalPages}
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
    </section>
  );
}
