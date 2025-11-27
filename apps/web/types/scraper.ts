export type ScraperResult = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  url: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScraperFilter = {
  keywords: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  page: number;
  limit: number;
};

export type ScraperKeyword = {
  id: string;
  keyword: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: string[];
  categoryNames: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ScraperKeywordPage = {
  data: ScraperKeyword[];
  total: number;
  page: number;
  pageSize: number;
};

export type KeywordCategory = {
  id: string;
  name: string;
  parentId: string | null;
};
