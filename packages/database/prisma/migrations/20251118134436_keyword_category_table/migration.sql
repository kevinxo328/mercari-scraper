/*
  Warnings:

  - You are about to drop the column `category` on the `ScraperKeyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScraperKeyword" DROP COLUMN "category",
ADD COLUMN     "categoryIds" UUID[];

-- DropEnum
DROP TYPE "public"."Category";

-- CreateTable
CREATE TABLE "KeywordCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeywordCategory_name_key" ON "KeywordCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordCategory_code_key" ON "KeywordCategory"("code");
