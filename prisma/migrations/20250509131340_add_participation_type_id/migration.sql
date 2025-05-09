-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "note" VARCHAR(500),
ADD COLUMN     "participationTypeId" INTEGER,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "uid" TEXT,
ADD COLUMN     "webProfile" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_participationTypeId_fkey" FOREIGN KEY ("participationTypeId") REFERENCES "ParticipationType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
