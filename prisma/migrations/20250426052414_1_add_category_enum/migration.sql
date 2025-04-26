/*
  Warnings:

  - The `category` column on the `ScrapeKeyword` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MENFASHION');

-- AlterTable
ALTER TABLE "ScrapeKeyword" DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'MENFASHION';
