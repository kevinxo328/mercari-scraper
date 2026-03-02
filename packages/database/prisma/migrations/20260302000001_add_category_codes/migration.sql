-- AlterTable: add temporary categoryCodes column to ScraperKeyword
-- This column will hold Mercari category codes (strings) as a transition
-- from the UUID-based categoryIds. After data migration, this column will
-- be renamed to categoryIds and the old UUID column will be dropped.
ALTER TABLE "ScraperKeyword" ADD COLUMN "categoryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;
