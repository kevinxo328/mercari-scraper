/*
  Warnings:

  - Added the required column `currency` to the `ScrapeResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScrapeResult" ADD COLUMN     "currency" VARCHAR(20) NOT NULL;
