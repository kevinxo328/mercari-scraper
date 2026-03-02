## Architecture

### Component Family (shadcn-style composition)

```
<TreeSelect value onValueChange>          ← Context provider + state
  <TreeSelectTrigger placeholder />       ← Popover trigger + badge display
  <TreeSelectContent>                     ← Popover wrapper (custom div scrolling)
    <TreeSelectSearch />                  ← Search input (standard Input)
    <TreeSelectGroup items />             ← Recursive tree renderer
  </TreeSelectContent>
</TreeSelect>
```

Each sub-component is exported individually and composable by the caller.
Internal state (selected values, expanded nodes, search query) lives in `TreeSelect` context.

### File Layout

```
apps/web/components/tree-select/
├── index.ts              ← re-exports all public symbols
├── tree-select.tsx       ← <TreeSelect>: context + state + keyboard navigation manager
├── trigger.tsx           ← <TreeSelectTrigger>: badge chips + popover trigger
├── content.tsx           ← <TreeSelectContent>: popover shell (scroll container)
├── search.tsx            ← <TreeSelectSearch>: controlled search input
├── group.tsx             ← <TreeSelectGroup>: renders TreeNode[] recursively
├── item.tsx              ← <TreeSelectItem>: single node (chevron + checkbox)
├── types.ts              ← TreeNode, TreeSelectContextValue
├── utils.ts              ← buildFlatMap(), getAncestors(), filterNodes()
└── tree-select.test.tsx  ← TDD tests
```

### Generic Data Contract

```ts
// types.ts
interface TreeNode {
  value: string;
  label: string;
  children?: TreeNode[];
}

// tRPC getCategories returns:
interface GetCategoriesResult {
  tree: TreeNode[];                              // for rendering
  map: Record<string, { label: string; path: string[] }>; // for breadcrumb + search
}
// `path` = ancestor labels from root to node (inclusive), e.g. ["ファッション","レディース","トップス"]
```

### State Model

```ts
// Lives in TreeSelect context
{
  selectedValues: string[];        // stored IDs (only explicitly selected nodes)
  expandedValues: Set<string>;     // expanded node IDs
  searchQuery: string;
}
```

Selection semantics:
- Selecting a **parent** stores only the parent ID; descendants are shown as "inherited" (checked, non-interactive)
- Selecting a **child** when parent is also selected is a no-op
- Deselecting a parent removes only the parent; descendants revert to unchecked
- A node shows **indeterminate** when some (not all) children are in selectedValues without the parent

### Node Visual States

| State | Condition |
|---|---|
| Unchecked | Not selected, no selected ancestor |
| Checked (direct) | Node value is in `selectedValues` |
| Checked (inherited) | An ancestor is in `selectedValues` — disabled, non-interactive |
| Indeterminate | At least one descendant in `selectedValues`, but not the node itself |

### Badge Display

Selected values render as chips in `TreeSelectTrigger`. Label = path **excluding the top-level ancestor**:

```
value "1" (レディース, depth=1) → badge: "レディース"
value "121" (depth=4)          → badge: "レディース > トップス > シャツ > 半袖"
```

Uses `map[value].path.slice(1).join(' > ')` (drop index 0 = top-level label).

### Modes

**Tree mode** (no search query):
- Renders only root nodes initially (22 items for Mercari categories)
- Expanding a node renders its direct children inline
- Performance: O(visible nodes), not O(total nodes)

**Search mode** (search query present):
- Filters `map` entries by label substring match — pure JS, no DOM
- Renders matching nodes as a flat list with full breadcrumb paths
- Clears expanded state to avoid confusion

### Performance Decisions (Vercel React Best Practices)

| Rule | Application |
|---|---|
| `rerender-memo` | `TreeSelectItem` wrapped in `React.memo` — avoids re-render when siblings change |
| `js-index-maps` | `map` from tRPC used for O(1) breadcrumb + ancestor lookup instead of tree traversal |
| `rerender-lazy-state-init` | `expandedValues` initialized as `new Set()` via lazy initializer |
| `rerender-derived-state-no-effect` | Inherited/indeterminate state derived during render from `selectedValues`, no separate effect |
| `rendering-conditional-render` | Ternary (`searchQuery ? <SearchResults> : <TreeGroup>`) not `&&` |
| `event-isolation` | `onWheel` stopPropagation on scroll container to fix mouse scrolling inside Dialogs |
| `rerender-functional-setstate` | All `setSelectedValues` calls use functional form `(prev) => ...` for stable callbacks |

### tRPC Change

```ts
// Before
getCategories: () => MercariCategory[]   // 8,781 flat items, sorted by name

// After
getCategories: () => {
  tree: TreeNode[];                       // 22 root nodes, children nested
  map: Record<string, { label: string; path: string[] }>;  // 8,781 entries for lookup
}
```

The `map` is built server-side once via a DFS traversal of the raw JSON tree, carrying the `path` array for each node. This avoids any client-side tree traversal for breadcrumb resolution.

### Testing Strategy (TDD)

Tests in `tree-select.test.tsx` are written **before** implementation. Coverage targets:

1. `utils.ts` — pure functions (buildFlatMap, filterNodes, getInheritedValues) tested with minimal fixture data
2. `<TreeSelect>` integration — render, select, deselect, parent/child inheritance, indeterminate state
3. `<TreeSelectSearch>` — filter results, breadcrumb display
4. `<TreeSelectTrigger>` — badge label formatting (path slice)
5. Keyboard navigation — Enter to expand, Space to select

Test tooling: Jest + React Testing Library (already configured in the project).
