-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MENFASHION');

-- CreateTable
CREATE TABLE "ScrapeKeyword" (
    "id" UUID NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "category" "Category" NOT NULL DEFAULT 'MENFASHION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeResult" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ScrapeKeywordToScrapeResult" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ScrapeKeywordToScrapeResult_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeKeyword_keyword_key" ON "ScrapeKeyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeResult_url_key" ON "ScrapeResult"("url");

-- CreateIndex
CREATE INDEX "_ScrapeKeywordToScrapeResult_B_index" ON "_ScrapeKeywordToScrapeResult"("B");

-- AddForeignKey
ALTER TABLE "_ScrapeKeywordToScrapeResult" ADD CONSTRAINT "_ScrapeKeywordToScrapeResult_A_fkey" FOREIGN KEY ("A") REFERENCES "ScrapeKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScrapeKeywordToScrapeResult" ADD CONSTRAINT "_ScrapeKeywordToScrapeResult_B_fkey" FOREIGN KEY ("B") REFERENCES "ScrapeResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

