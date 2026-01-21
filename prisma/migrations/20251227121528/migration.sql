/*
  Warnings:

  - A unique constraint covering the columns `[name,creator_id]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,creator_id]` on the table `List` will be added. If there are existing duplicate values, this will fail.
  - Made the column `category` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "category" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_creator_id_key" ON "Item"("name", "creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "List_title_creator_id_key" ON "List"("title", "creator_id");
