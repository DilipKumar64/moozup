-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_speakerId_fkey";

-- CreateTable
CREATE TABLE "_EventAttendeeToSession" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventAttendeeToSession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventAttendeeToSession_B_index" ON "_EventAttendeeToSession"("B");

-- AddForeignKey
ALTER TABLE "_EventAttendeeToSession" ADD CONSTRAINT "_EventAttendeeToSession_A_fkey" FOREIGN KEY ("A") REFERENCES "EventAttendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAttendeeToSession" ADD CONSTRAINT "_EventAttendeeToSession_B_fkey" FOREIGN KEY ("B") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MIGRATION STEP: Copy data from old column to new join table
INSERT INTO "_EventAttendeeToSession" ("A", "B")
SELECT "speakerId", "id" FROM "Session" WHERE "speakerId" IS NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "speakerId";