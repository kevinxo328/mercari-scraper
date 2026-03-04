-- AlterTable
ALTER TABLE "ScraperRun" ALTER COLUMN "completedAt" DROP NOT NULL,
                         ALTER COLUMN "completedAt" DROP DEFAULT;
