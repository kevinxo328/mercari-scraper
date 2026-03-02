export interface TreeNode {
  value: string;
  label: string;
  children?: TreeNode[];
}

export interface FlatMapEntry {
  label: string;
  path: string[];
}

export interface TreeSelectContextValue {
  selectedValues: string[];
  toggleValue: (value: string, node: TreeNode) => void;
  clearAll: () => void;
  expandedValues: Set<string>;
  toggleExpanded: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  flatMap: Map<string, FlatMapEntry>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
