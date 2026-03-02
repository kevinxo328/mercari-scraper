## Why

The current category selector in `add-keyword-dialog` renders all 8,781 Mercari categories as a flat list inside `MultiSelect`, causing severe UI freezes on open. The underlying data is hierarchical (22 top-level nodes → up to 5 levels deep), so a lazy-expanding tree UI is both more performant and semantically correct.

## What Changes

- **NEW** Generic composable `TreeSelect` component family (shadcn-style) — `<TreeSelect>`, `<TreeSelectTrigger>`, `<TreeSelectContent>`, `<TreeSelectSearch>`, `<TreeSelectGroup>`, `<TreeSelectItem>` — lazy-renders only visible tree nodes, works with any `TreeNode` data
- **MODIFIED** `getCategories` tRPC endpoint — returns `TreeNode[]` (tree shaped with `value`, `label`, `children`) instead of a sorted flat array; also exposes a flat map for breadcrumb resolution
- **MODIFIED** `add-keyword-dialog` — replaces `MultiSelect` with the new `TreeSelect` family

## Capabilities

### New Capabilities

- `tree-select`: Generic composable multi-select component for hierarchical data. Lazy-expanding tree in a Popover. Supports: search mode (flat filtered list with breadcrumb paths), parent-node selection (implies all descendants shown as inherited), indeterminate state for partial child selection, badge display showing path from level-2 onward, keyboard navigation. One function component per file following shadcn composition patterns. Built test-first (TDD).

### Modified Capabilities

_(none)_

## Impact

- **`apps/web/trpc/routers/scraper.ts`** — `getCategories` return type changes to `{ tree: TreeNode[], map: Record<string, { label: string; path: string[] }> }`; existing callers (add-keyword-dialog) must be updated
- **`apps/web/components/tree-select/`** — new directory with 8 files (6 component files + types + utils)
- **`apps/web/components/dialog/add-keyword-dialog.tsx`** — replaces MultiSelect import
- **No new npm dependencies** — uses existing Radix Popover, cmdk, lucide-react, shadcn primitives
- **Performance** — initial render drops from 8,781 DOM nodes to 22; search filters in-memory against the flat map
