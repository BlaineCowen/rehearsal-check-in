/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Group` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `RehearsalGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "imageUrl",
DROP COLUMN "userId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RehearsalGroup" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehearsalGroup" ADD CONSTRAINT "RehearsalGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
