import categoriesData from './data/mercari-categories.json' with { type: 'json' };

export interface MercariCategory {
  code: string;
  name: string;
  enName: string;
  children?: MercariCategory[];
}

export interface MercariCategoryMapEntry {
  code: string;
  name: string;
  enName: string;
  parentCode: string | null;
}

export interface MercariCategoriesJSON {
  tree: MercariCategory[];
  map: Record<string, MercariCategoryMapEntry>;
}

export const mercariCategories = categoriesData as MercariCategoriesJSON;

/** O(1) lookup by Mercari category code */
export function getCategoryByCode(
  code: string
): MercariCategoryMapEntry | undefined {
  return mercariCategories.map[code];
}
