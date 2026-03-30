/*
  Warnings:

  - You are about to drop the column `checked` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `list_id` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `List` table. All the data in the column will be lost.
  - You are about to drop the `ListMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `is_global` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `List` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `List` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_list_id_fkey";

-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "ListMember" DROP CONSTRAINT "ListMember_list_id_fkey";

-- DropForeignKey
ALTER TABLE "ListMember" DROP CONSTRAINT "ListMember_user_id_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "checked",
DROP COLUMN "list_id",
DROP COLUMN "quantity",
ADD COLUMN     "creator_id" INTEGER,
ADD COLUMN     "is_global" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "List" DROP COLUMN "name",
DROP COLUMN "owner_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_hash" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "ListMember";

-- CreateTable
CREATE TABLE "UserList" (
    "user_id" INTEGER NOT NULL,
    "list_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("user_id","list_id")
);

-- CreateTable
CREATE TABLE "ListItem" (
    "list_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ListItem_pkey" PRIMARY KEY ("list_id","item_id")
);

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Item"
ADD CONSTRAINT item_global_or_custom_check
CHECK (
  ("is_global" = TRUE AND "creator_id" IS NULL)
  OR
  ("is_global" = FALSE AND "creator_id" IS NOT NULL)
);