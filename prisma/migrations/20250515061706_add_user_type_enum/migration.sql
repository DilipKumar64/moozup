/*
  Warnings:

  - The `userType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('EVENT', 'COMMUNITY');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'EVENT';
