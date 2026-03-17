-- AlterTable
ALTER TABLE "SavedItem" ADD COLUMN     "book" TEXT,
ADD COLUMN     "jp" TEXT,
ADD COLUMN     "meanings" JSONB,
ADD COLUMN     "phonetic" TEXT;
