-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "documentData" BYTEA,
ADD COLUMN     "documentFileName" TEXT,
ADD COLUMN     "documentMimeType" TEXT;
