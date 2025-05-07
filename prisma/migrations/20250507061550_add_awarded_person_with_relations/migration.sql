-- CreateTable
CREATE TABLE "AwardedPerson" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "awardId" INTEGER NOT NULL,
    "personName" TEXT NOT NULL,
    "action" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AwardedPerson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AwardedPerson" ADD CONSTRAINT "AwardedPerson_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardedPerson" ADD CONSTRAINT "AwardedPerson_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardedPerson" ADD CONSTRAINT "AwardedPerson_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "AwardType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
