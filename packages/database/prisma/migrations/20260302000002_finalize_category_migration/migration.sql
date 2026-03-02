-- IMPORTANT: Run migrate-category-ids.ts script BEFORE applying this migration
-- to ensure categoryCodes are populated from the old UUID-based categoryIds.

-- Step 1: Drop the old UUID-based categoryIds column
ALTER TABLE "ScraperKeyword" DROP COLUMN "categoryIds";

-- Step 2: Rename categoryCodes to categoryIds
ALTER TABLE "ScraperKeyword" RENAME COLUMN "categoryCodes" TO "categoryIds";

-- Step 3: Drop the KeywordCategory table (data is now in static JSON)
DROP TABLE IF EXISTS "KeywordCategory";
