-- AlterTable
ALTER TABLE "ScraperRun"
ADD COLUMN "successfulKeywordCount" INTEGER NOT NULL DEFAULT 0;

-- Existing completed runs predate per-keyword success tracking. Keep them as
-- eligible homepage baselines until a newly tracked run replaces them.
UPDATE "ScraperRun"
SET "successfulKeywordCount" = 1
WHERE "completedAt" IS NOT NULL;
