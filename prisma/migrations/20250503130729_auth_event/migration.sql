/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,eventStartDate]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_title_date_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "createdAt",
DROP COLUMN "date",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "updatedAt",
ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "dateTimeCreated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateTimeModified" TIMESTAMP(3),
ADD COLUMN     "eventCategory" TEXT,
ADD COLUMN     "eventDescription" TEXT,
ADD COLUMN     "eventEndDate" TIMESTAMP(3),
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "eventStartDate" TIMESTAMP(3),
ADD COLUMN     "eventUrl" TEXT,
ADD COLUMN     "hostOrganizationDescription" TEXT,
ADD COLUMN     "hostOrganizationName" TEXT,
ADD COLUMN     "hostWebsiteUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "isFreeEvent" BOOLEAN DEFAULT false,
ADD COLUMN     "isPrivateEvent" BOOLEAN DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN DEFAULT false,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "markDelete" BOOLEAN DEFAULT false,
ADD COLUMN     "modifiedBy" INTEGER,
ADD COLUMN     "sponsorLogoPath" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "Event_Cateory" (
    "id" SERIAL NOT NULL,
    "categoryName" VARCHAR(800),
    "count" INTEGER,

    CONSTRAINT "Event_Cateory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_title_eventStartDate_key" ON "Event"("title", "eventStartDate");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Event_Cateory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
