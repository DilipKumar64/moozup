-- CreateTable
CREATE TABLE "staticContent" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FAQs" TEXT,
    "EventInfo" TEXT,
    "Questionnaire" TEXT,
    "StaticContent1" TEXT,
    "StaticContent2" TEXT,
    "StaticContent3" TEXT,
    "StaticContent4" TEXT,
    "StaticContent5" TEXT,
    "StaticContent6" TEXT,
    "StaticContent7" TEXT,
    "NonMenuStaticContent1" TEXT,
    "NonMenuStaticContent2" TEXT,
    "NonMenuStaticContent3" TEXT,
    "NonMenuStaticContent4" TEXT,
    "NonMenuStaticContent5" TEXT,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "staticContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "staticContent" ADD CONSTRAINT "staticContent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staticContent" ADD CONSTRAINT "staticContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
