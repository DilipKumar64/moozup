-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isSpeakathon" BOOLEAN NOT NULL DEFAULT false,
    "enableFeedback" BOOLEAN NOT NULL DEFAULT false,
    "venue" TEXT,
    "hall" TEXT,
    "track" TEXT,
    "keywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionTypeId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "sponsorTypeId" INTEGER,
    "sponsorName" TEXT,
    "speakerId" INTEGER,
    "participationTypeId" INTEGER,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sponsorTypeId_fkey" FOREIGN KEY ("sponsorTypeId") REFERENCES "SponsorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_participationTypeId_fkey" FOREIGN KEY ("participationTypeId") REFERENCES "ParticipationType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
