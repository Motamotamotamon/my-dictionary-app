/*
  Warnings:

  - You are about to drop the column `note` on the `SavedItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wordId,type]` on the table `SavedItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SavedItem" DROP COLUMN "note";

-- CreateIndex
CREATE UNIQUE INDEX "SavedItem_wordId_type_key" ON "SavedItem"("wordId", "type");
