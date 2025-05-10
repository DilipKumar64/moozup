/*
  Warnings:

  - The primary key for the `GalleryGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `galleryId` on the `GalleryGroup` table. All the data in the column will be lost.
  - The `id` column on the `GalleryGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `groupId` column on the `GalleryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "GalleryItem" DROP CONSTRAINT "GalleryItem_groupId_fkey";

-- AlterTable
ALTER TABLE "GalleryGroup" DROP CONSTRAINT "GalleryGroup_pkey",
DROP COLUMN "galleryId",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GalleryGroup_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GalleryItem" DROP COLUMN "groupId",
ADD COLUMN     "groupId" INTEGER;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GalleryGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
