import { FlatMapEntry, TreeNode } from './types';

export function buildFlatMap(
  tree: TreeNode[],
  ancestorPath: string[] = [],
  result: Map<string, FlatMapEntry> = new Map()
): Map<string, FlatMapEntry> {
  for (const node of tree) {
    const path = [...ancestorPath, node.label];
    result.set(node.value, { label: node.label, path });
    if (node.children?.length) {
      buildFlatMap(node.children, path, result);
    }
  }
  return result;
}

export function getDescendantValues(node: TreeNode): string[] {
  if (!node.children?.length) return [];
  const result: string[] = [];
  for (const child of node.children) {
    result.push(child.value);
    result.push(...getDescendantValues(child));
  }
  return result;
}

export function hasSelectedAncestor(
  value: string,
  selectedValues: string[],
  flatMap: Map<string, FlatMapEntry>
): boolean {
  const entry = flatMap.get(value);
  if (!entry) return false;
  // path includes the node itself at the end; check all entries except the last
  const ancestorLabels = entry.path.slice(0, -1);
  for (const [v, e] of flatMap) {
    if (v !== value && ancestorLabels.includes(e.path[e.path.length - 1])) {
      if (
        selectedValues.includes(v) &&
        e.path.length < entry.path.length &&
        entry.path.slice(0, e.path.length).join() === e.path.join()
      ) {
        return true;
      }
    }
  }
  return false;
}

export function getIndeterminate(
  value: string,
  selectedValues: string[],
  tree: TreeNode[],
  flatMap: Map<string, FlatMapEntry>
): boolean {
  if (selectedValues.includes(value)) return false;
  const node = findNode(value, tree);
  if (!node) return false;
  const descendants = getDescendantValues(node);
  return descendants.some((d) => selectedValues.includes(d));
}

export interface FilterResult {
  value: string;
  label: string;
  path: string[];
  children?: TreeNode[];
}

export function filterNodes(
  flatMap: Map<string, FlatMapEntry>,
  query: string,
  tree: TreeNode[]
): FilterResult[] {
  if (!query) return [];
  const lower = query.toLowerCase();
  const results: FilterResult[] = [];
  for (const [value, entry] of flatMap) {
    if (entry.label.toLowerCase().includes(lower)) {
      const node = findNode(value, tree);
      results.push({
        value,
        label: entry.label,
        path: entry.path,
        children: node?.children
      });
    }
  }
  return results;
}

export function findNode(value: string, tree: TreeNode[]): TreeNode | undefined {
  for (const node of tree) {
    if (node.value === value) return node;
    if (node.children?.length) {
      const found = findNode(value, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function getVisibleNodes(
  tree: TreeNode[],
  expandedValues: Set<string>
): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length && expandedValues.has(node.value)) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return result;
}
