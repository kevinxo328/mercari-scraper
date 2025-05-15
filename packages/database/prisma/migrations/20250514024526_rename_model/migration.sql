-- AlterTable
ALTER TABLE "ScraperKeyword" RENAME CONSTRAINT "ScrapeKeyword_pkey" TO "ScraperKeyword_pkey";

-- AlterTable
ALTER TABLE "ScraperResult" RENAME CONSTRAINT "ScrapeResult_pkey" TO "ScraperResult_pkey";

-- AlterTable
ALTER TABLE "_ScraperKeywordToScraperResult" RENAME CONSTRAINT "_ScrapeKeywordToScrapeResult_AB_pkey" TO "_ScraperKeywordToScraperResult_AB_pkey";

-- RenameIndex
ALTER INDEX "ScrapeKeyword_keyword_key" RENAME TO "ScraperKeyword_keyword_key";

-- RenameIndex
ALTER INDEX "ScrapeResult_url_key" RENAME TO "ScraperResult_url_key";
