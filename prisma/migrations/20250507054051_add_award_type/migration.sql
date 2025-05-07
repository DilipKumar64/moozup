-- CreateTable
CREATE TABLE "AwardType" (
    "id" SERIAL NOT NULL,
    "awardType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "AwardType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AwardType_awardType_key" ON "AwardType"("awardType");

-- AddForeignKey
ALTER TABLE "AwardType" ADD CONSTRAINT "AwardType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
