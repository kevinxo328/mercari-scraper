-- CreateTable
CREATE TABLE "ScraperRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScraperRun_pkey" PRIMARY KEY ("id")
);
