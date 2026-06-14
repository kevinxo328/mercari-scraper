-- AlterTable
ALTER TABLE "ScraperResult" ADD COLUMN "firstSeenRunId" UUID,
ADD COLUMN "previousPrice" INTEGER,
ADD COLUMN "priceChangedAt" TIMESTAMP(3),
ADD COLUMN "priceChangedRunId" UUID;

-- CreateIndex
CREATE INDEX "ScraperResult_firstSeenRunId_idx" ON "ScraperResult"("firstSeenRunId");

-- CreateIndex
CREATE INDEX "ScraperResult_priceChangedRunId_idx" ON "ScraperResult"("priceChangedRunId");

-- CreateIndex
CREATE INDEX "ScraperResult_updatedAt_idx" ON "ScraperResult"("updatedAt");
