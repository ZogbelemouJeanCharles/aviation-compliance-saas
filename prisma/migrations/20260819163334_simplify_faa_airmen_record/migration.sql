/*
  Warnings:

  - You are about to drop the column `certificateNumber` on the `FaaAirmenRecord` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FaaAirmenRecord_certificateNumber_idx";

-- AlterTable
ALTER TABLE "FaaAirmenRecord" DROP COLUMN "certificateNumber";
