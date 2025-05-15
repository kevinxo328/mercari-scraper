-- Rename tables instead of dropping and recreating
ALTER TABLE "ScrapeKeyword" RENAME TO "ScraperKeyword";
ALTER TABLE "ScrapeResult" RENAME TO "ScraperResult";
ALTER TABLE "_ScrapeKeywordToScrapeResult" RENAME TO "_ScraperKeywordToScraperResult";

-- Update foreign key constraint names (these names may vary depending on your database)
-- You might need to check the actual constraint names in your database
ALTER INDEX IF EXISTS "_ScrapeKeywordToScrapeResult_AB_unique" RENAME TO "_ScraperKeywordToScraperResult_AB_unique";
ALTER INDEX IF EXISTS "_ScrapeKeywordToScrapeResult_B_index" RENAME TO "_ScraperKeywordToScraperResult_B_index";
