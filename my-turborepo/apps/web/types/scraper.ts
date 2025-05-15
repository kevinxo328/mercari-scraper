export type ScraperResult = {
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
  createdAt: Date;
  updatedAt: Date;
};
