/*
  Warnings:

  - You are about to drop the column `action` on the `FeatureTabSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeatureTabSetting" DROP COLUMN "action",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER;
