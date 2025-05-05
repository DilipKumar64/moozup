/*
  Warnings:

  - You are about to drop the `Event_Cateory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropIndex
DROP INDEX "Event_title_eventStartDate_key";

-- DropTable
DROP TABLE "Event_Cateory";

-- CreateTable
CREATE TABLE "Event_Category" (
    "id" SERIAL NOT NULL,
    "categoryName" VARCHAR(800),
    "count" INTEGER,

    CONSTRAINT "Event_Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendee_userId_eventId_key" ON "EventAttendee"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Event_Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
