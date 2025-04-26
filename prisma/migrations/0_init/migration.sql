-- CreateTable
CREATE TABLE "ScrapeKeyword" (
    "id" UUID NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "category" VARCHAR(10) NOT NULL,
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
    "keywordId" UUID NOT NULL,

    CONSTRAINT "ScrapeResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeKeyword_keyword_key" ON "ScrapeKeyword"("keyword");

-- AddForeignKey
ALTER TABLE "ScrapeResult" ADD CONSTRAINT "ScrapeResult_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "ScrapeKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

