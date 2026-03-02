# Tasks: category-tree-select

Implementation follows TDD: tests are written before each implementation task.

---

## 1. Types & utilities (foundation)

### 1.1 Define shared types
- File: `apps/web/components/tree-select/types.ts`
- Export `TreeNode`, `TreeSelectContextValue`
- Include `TreeSelectContext` (React context object)

### 1.2 Write utils tests first
- File: `apps/web/components/tree-select/tree-select.test.tsx`
- Test cases for `buildFlatMap(tree)`:
  - Returns a `Map<string, { label: string; path: string[] }>`
  - Root node path is `[rootLabel]`
  - Leaf node path includes all ancestors
- Test cases for `getDescendantValues(node)`:
  - Returns all descendant `value` strings (not the node itself)
- Test cases for `hasSelectedAncestor(value, selectedValues, flatMap)`:
  - Returns true when any ancestor is in `selectedValues`
- Test cases for `getIndeterminate(value, selectedValues, flatMap)`:
  - Returns true when a descendant (not self) is selected and self is not
- Test cases for `filterNodes(flatMap, query)`:
  - Returns entries whose `label` includes query (case-insensitive)
  - Returns empty array for no matches

### 1.3 Implement utils
- File: `apps/web/components/tree-select/utils.ts`
- Implement all functions tested in 1.2
- Use `Map` for O(1) lookups (js-index-maps rule)
- All functions are pure (no side effects)

---

## 2. tRPC endpoint update

### 2.1 Write tRPC test
- File: `apps/web/trpc/routers/scraper.test.ts` (create if not exists)
- Test that `getCategories` returns:
  - `tree`: array of root `TreeNode` objects with `value`, `label`, `children`
  - `map`: flat record with `label` and `path` for every node
  - `enName` is preferred over `name` when non-empty
  - `map` entry count equals total nodes in `mercariCategories.map`

### 2.2 Update `getCategories` endpoint
- File: `apps/web/trpc/routers/scraper.ts`
- Build `tree: TreeNode[]` via DFS over `mercariCategories.tree`
  - `value = node.code`, `label = node.enName || node.name`
  - Recurse into `children` if present
- Build `map: Record<string, { label: string; path: string[] }>` via DFS, accumulating ancestor path
- Return `{ tree, map }`

---

## 3. Core component: `<TreeSelect>`

### 3.1 Write context tests
- Add to `tree-select.test.tsx`:
  - `<TreeSelect>` provides context accessible by children
  - `value` prop initialises `selectedValues`
  - `onValueChange` is called with updated array on selection

### 3.2 Implement `tree-select.tsx`
- Creates React context with `TreeSelectContextValue`
- Manages `selectedValues`, `expandedValues` (Set, lazy init), `searchQuery`
- Wraps children in Radix `<Popover>`
- All `setSelectedValues` calls use functional form (rerender-functional-setstate)

---

## 4. `<TreeSelectItem>` — single tree node

### 4.1 Write item tests
- Add to `tree-select.test.tsx`:
  - Renders node label
  - Shows chevron for parent node, hidden for leaf
  - Clicking checkbox calls `toggleValue` from context
  - Shows checked state when value is in selectedValues
  - Shows inherited (checked + disabled) when ancestor is selected
  - Shows indeterminate when descendant is selected
  - `aria-checked="mixed"` on indeterminate
  - `aria-checked="true"` on checked (direct or inherited)
  - `aria-level` matches depth

### 4.2 Implement `item.tsx`
- Wrapped in `React.memo` (rerender-memo rule)
- Derives `isChecked`, `isInherited`, `isIndeterminate` during render from context (no effect)
- Uses `ChevronRight` / `ChevronDown` from lucide-react for expand toggle
- Uses shadcn `Checkbox` for selection
- Indented by `depth * 16px`

---

## 5. `<TreeSelectGroup>` — recursive tree renderer

### 5.1 Write group tests
- Add to `tree-select.test.tsx`:
  - Renders only root nodes initially
  - Clicking chevron on a parent shows its children
  - Clicking again hides children
  - Children render with incremented depth
  - Does not render children of collapsed parents (lazy)

### 5.2 Implement `group.tsx`
- Accepts `items: TreeNode[]` and `depth?: number`
- For each item: renders `<TreeSelectItem>`, then conditionally renders `<TreeSelectGroup items={item.children} depth={depth+1} />` when expanded
- Expansion state read from context `expandedValues`

---

## 6. `<TreeSelectSearch>`

### 6.1 Write search tests
- Add to `tree-select.test.tsx`:
  - Typing in search input updates `searchQuery` in context
  - Clearing search restores tree mode

### 6.2 Implement `search.tsx`
- Thin wrapper around cmdk `<CommandInput>`
- Reads/writes `searchQuery` from context
- Clears `expandedValues` when query becomes non-empty

---

## 7. `<TreeSelectContent>`

### 7.1 Write content tests
- Add to `tree-select.test.tsx`:
  - In tree mode: renders `<TreeSelectGroup>`
  - In search mode (non-empty query): renders flat filtered list
  - Flat list shows breadcrumb path for each result
  - "No results found." when filter is empty
  - `role="tree"` on tree mode container, `role="listbox"` on search mode container

### 7.2 Implement `content.tsx`
- Lazy-loaded via `next/dynamic` (bundle-dynamic-imports rule)
- Uses ternary to switch between tree mode and search mode (rendering-conditional-render rule)
- Search mode: iterates `filterNodes(map, searchQuery)`, renders items with full path label
- Wraps output in Radix `<PopoverContent>` + cmdk `<Command>` + `<CommandList>`

---

## 8. `<TreeSelectTrigger>`

### 8.1 Write trigger tests
- Add to `tree-select.test.tsx`:
  - Shows placeholder when `selectedValues` is empty
  - Renders one badge per selected value
  - Badge label: `path.slice(1).join(' > ')` from map
  - Root-level selection badge shows just the node label
  - Clicking × on badge removes that value
  - Global clear button removes all values
  - `+ N more` shown when selected count exceeds `maxCount`
  - `aria-expanded` reflects popover state

### 8.2 Implement `trigger.tsx`
- Renders Radix `<PopoverTrigger>` as a `<Button>` (same className pattern as MultiSelect trigger)
- Badge rendering: `selectedValues.slice(0, maxCount).map(v => map[v].path.slice(1).join(' > '))`
- Uses `ChevronDown`, `XIcon`, `XCircle` from lucide-react
- Uses shadcn `Badge`

---

## 9. `index.ts` barrel export

- File: `apps/web/components/tree-select/index.ts`
- Export: `TreeSelect`, `TreeSelectTrigger`, `TreeSelectContent`, `TreeSelectSearch`, `TreeSelectGroup`, `TreeSelectItem`
- Export types: `TreeNode`, `TreeSelectProps`, `TreeSelectTriggerProps`, `TreeSelectGroupProps`
- **Direct exports only** — no re-export of internal context or utils (bundle-barrel-imports: import directly from source in internal usage)

---

## 10. Integrate into `add-keyword-dialog`

### 10.1 Write dialog integration test
- File: `apps/web/components/dialog/add-keyword-dialog.test.tsx` (create if not exists)
- Mock `trpc.scraper.getCategories` to return a small fixture tree
- Test that selecting a category calls `form.setValue('categoryIds', [...])`
- Test that editing a keyword pre-populates `categoryIds` correctly

### 10.2 Update `add-keyword-dialog.tsx`
- Replace `MultiSelect` import with `TreeSelect` family imports
- Replace `categories.map(c => ({ label: c.name, value: c.id }))` with `data.tree` (already TreeNode[])
- Pass `data.map` to a context value so trigger can resolve breadcrumb labels
- Remove `isLoadingCategories` loading branch text; use `Skeleton` from shadcn instead

---

## 11. Run full test suite & fix

- Run `pnpm test --filter @mercari-scraper/web`
- All new tests must pass
- No regressions in existing tests

---

## Task Order

```
1.1 → 1.2 → 1.3
            ↓
      2.1 → 2.2
            ↓
      3.1 → 3.2
            ↓
      4.1 → 4.2
      5.1 → 5.2   (parallel with 4)
      6.1 → 6.2   (parallel with 4)
            ↓
      7.1 → 7.2
      8.1 → 8.2   (parallel with 7)
            ↓
            9
            ↓
     10.1 → 10.2
            ↓
            11
```
