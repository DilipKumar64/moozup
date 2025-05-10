-- CreateTable
CREATE TABLE "PublicationsGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PublicationsGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationsItem" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationsGroupId" INTEGER,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PublicationsItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublicationsItem" ADD CONSTRAINT "PublicationsItem_publicationsGroupId_fkey" FOREIGN KEY ("publicationsGroupId") REFERENCES "PublicationsGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationsItem" ADD CONSTRAINT "PublicationsItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationsItem" ADD CONSTRAINT "PublicationsItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
