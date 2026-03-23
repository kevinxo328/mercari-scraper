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
  pinned: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: string[];
  categoryNames: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ScraperKeywordPage = {
  data: ScraperKeyword[];
  total: number;
  page: number;
  pageSize: number;
};
