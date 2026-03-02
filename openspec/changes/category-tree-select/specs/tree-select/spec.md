# Capability: tree-select

Generic composable multi-select component for hierarchical (tree-structured) data, following shadcn composition patterns.

---

## Data

### TreeNode

```ts
interface TreeNode {
  value: string;   // unique identifier
  label: string;   // display text
  children?: TreeNode[];
}
```

A node with no `children` (or empty array) is a **leaf node**.
A node with one or more `children` is a **parent node**.

---

## Composition API

```tsx
<TreeSelect value={string[]} onValueChange={(values: string[]) => void}>
  <TreeSelectTrigger placeholder={string} className? />
  <TreeSelectContent>
    <TreeSelectSearch />
    <TreeSelectGroup items={TreeNode[]} />
  </TreeSelectContent>
</TreeSelect>
```

All sub-components are individually importable from `@/components/tree-select`.

---

## Selection Behaviour

### Selecting a parent node
- Only the parent's `value` is added to `selectedValues`
- All descendant nodes are shown as **inherited-checked** (visually checked, non-interactive)
- Attempting to select/deselect a descendant while its ancestor is selected has no effect

### Selecting a leaf node
- The leaf's `value` is added to `selectedValues`
- Its ancestor nodes show **indeterminate** state (some but not all descendants selected)

### Deselecting a node
- The node's `value` is removed from `selectedValues`
- Descendants revert to unchecked (or their own explicit state if independently selected)

### Node visual states

| State | CSS/aria | Condition |
|---|---|---|
| Unchecked | `aria-checked="false"` | Not selected, no selected ancestor |
| Checked (direct) | `aria-checked="true"` | `value` is in `selectedValues` |
| Checked (inherited) | `aria-checked="true"`, `disabled` | An ancestor's `value` is in `selectedValues` |
| Indeterminate | `aria-checked="mixed"` | A descendant (not self) is in `selectedValues` |

---

## Tree Mode (no search query)

- Initially renders only **root-level nodes**
- A parent node has a chevron icon indicating it can be expanded
- Clicking the chevron (or pressing Enter/ArrowRight on the node) **expands** it, revealing direct children inline
- Clicking again (or ArrowLeft) **collapses** it
- Expansion state is local UI state; it does not affect `selectedValues`
- Only visible nodes are rendered in the DOM (**lazy rendering**)

---

## Search Mode (search query present)

- Activated when `<TreeSelectSearch />` has a non-empty value
- Renders a **flat list** of all nodes whose `label` contains the search string (case-insensitive)
- Each result displays the **full breadcrumb path** (all ancestor labels joined by ` > `)
- The tree expand/collapse state is suspended while search is active
- An empty result set displays "No results found."

---

## Trigger & Badge Display

- `<TreeSelectTrigger>` renders a button matching the MultiSelect trigger style (border, min-h-10, h-auto, flex-wrap)
- When `selectedValues` is empty: shows `placeholder` text
- When `selectedValues` is non-empty: renders one badge chip per selected value
- **Badge label**: the node's ancestor path **excluding the root (depth-0) ancestor**, joined by ` > `
  - Depth-1 node → badge shows only the node's own label
  - Deeper node → badge shows `level1 > level2 > … > nodeName`
- Badges beyond `maxCount` (default 3) are collapsed into `+ N more`
- An × icon on each badge removes that value from selection
- A global clear button removes all selected values

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `ArrowDown` / `ArrowUp` | Move focus between visible nodes |
| `ArrowRight` | Expand focused parent node |
| `ArrowLeft` | Collapse focused parent node |
| `Space` or `Enter` (on node) | Toggle selection |
| `Escape` | Close popover |
| `Tab` | Move to next focusable element (closes popover) |

---

## Accessibility

- Trigger button: `role="combobox"`, `aria-expanded`, `aria-haspopup="tree"`
- Popover content: `role="tree"`
- Each node: `role="treeitem"`, `aria-expanded` (parents), `aria-checked`, `aria-level`, `aria-selected`
- Screen reader announcements on selection change (added/removed item count)

---

## Props Contract

### `<TreeSelect>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string[]` | yes | Controlled selected values |
| `onValueChange` | `(values: string[]) => void` | yes | Called on every selection change |
| `children` | `React.ReactNode` | yes | Composable sub-components |

### `<TreeSelectTrigger>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `"Select options"` | Shown when nothing selected |
| `maxCount` | `number` | `3` | Max badges before "+ N more" |
| `className` | `string` | — | Extra CSS classes |
| `disabled` | `boolean` | `false` | Disables interaction |

### `<TreeSelectGroup>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `items` | `TreeNode[]` | yes | Root-level nodes to render |
| `depth` | `number` | `0` (internal) | Current nesting depth (used for indent) |

### `<TreeSelectSearch>`

No required props. Reads/writes search query from context.

---

## Constraints

- No new npm dependencies; uses Radix Popover, cmdk Command, lucide-react, shadcn primitives
- `<TreeSelectContent>` is lazy-loaded (`next/dynamic`) to avoid bundling cmdk on initial page load
- `<TreeSelectItem>` is wrapped in `React.memo`
- All state updates to `selectedValues` use functional `setState` form
- Derived states (inherited, indeterminate) are computed during render, not in effects
