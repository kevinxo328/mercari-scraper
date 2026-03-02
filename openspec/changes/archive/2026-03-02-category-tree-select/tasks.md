# Tasks: category-tree-select

Implementation follows TDD: tests are written before each implementation task.

---

## 1. Types & utilities

- [x] **1.1** Define shared types — `types.ts`: export `TreeNode`, `TreeSelectContextValue`, `TreeSelectContext`
- [x] **1.2** Write utils tests — `tree-select.test.tsx`: `buildFlatMap`, `getDescendantValues`, `hasSelectedAncestor`, `getIndeterminate`, `filterNodes`
- [x] **1.3** Implement utils — `utils.ts`: all pure functions, `Map` for O(1) lookups

## 2. tRPC endpoint

- [x] **2.1** Write tRPC test — `scraper.test.ts`: `getCategories` returns `{ tree: TreeNode[], map }`, `enName` preferred, map entry count matches source
- [x] **2.2** Update `getCategories` — `scraper.ts`: DFS to build `tree` and `map` with `path[]`, return `{ tree, map }`

## 3. `<TreeSelect>` root

- [x] **3.1** Write context tests — context accessible by children, `value` initialises state, `onValueChange` fires on selection
- [x] **3.2** Implement `tree-select.tsx` — React context, `selectedValues`, `expandedValues` (Set, lazy init), `searchQuery`, wraps `<Popover>`, functional setState

## 4. `<TreeSelectItem>`

- [x] **4.1** Write item tests — renders label, chevron for parent, checkbox toggle, checked/inherited/indeterminate states, `aria-checked`, `aria-level`
- [x] **4.2** Implement `item.tsx` — `React.memo`, derived state during render, `ChevronRight/Down`, shadcn `Checkbox`, depth indent

## 5. `<TreeSelectGroup>`

- [x] **5.1** Write group tests — renders root nodes only, expand/collapse on chevron click, incremented depth, lazy child rendering
- [x] **5.2** Implement `group.tsx` — recursive, reads `expandedValues` from context, renders `<TreeSelectItem>` + conditional `<TreeSelectGroup>`

## 6. `<TreeSelectSearch>`

- [x] **6.1** Write search tests — typing updates `searchQuery` in context, clearing restores tree mode
- [x] **6.2** Implement `search.tsx` — wraps cmdk `CommandInput`, reads/writes `searchQuery`, clears `expandedValues` on non-empty query

## 7. `<TreeSelectContent>`

- [x] **7.1** Write content tests — tree mode renders `TreeSelectGroup`, search mode renders flat list with breadcrumbs, empty state, correct roles
- [x] **7.2** Implement `content.tsx` — `next/dynamic` lazy load, ternary for tree/search mode, `filterNodes` for search, `PopoverContent` + `Command` + `CommandList`

## 8. `<TreeSelectTrigger>`

- [x] **8.1** Write trigger tests — placeholder when empty, badge per value, `path.slice(1).join(' > ')` label, × removes value, clear all, `+ N more`, `aria-expanded`
- [x] **8.2** Implement `trigger.tsx` — `PopoverTrigger` as `Button`, badge chips, `ChevronDown/XIcon/XCircle`, shadcn `Badge`, `maxCount`

## 9. Barrel export

- [x] **9.1** Create `index.ts` — export all 6 components + public types

## 10. Integration

- [x] **10.1** Write dialog integration test — mock `getCategories`, test category selection updates form, pre-population on edit
- [x] **10.2** Update `add-keyword-dialog.tsx` — replace `MultiSelect` with `TreeSelect` family, use `data.tree` directly, `Skeleton` for loading state

## 11. Final verification

- [x] **11.1** Run `pnpm test --filter @mercari-scraper/web` — all tests pass, no regressions
