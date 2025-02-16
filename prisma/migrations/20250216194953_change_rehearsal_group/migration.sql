/*
  Warnings:

  - You are about to drop the `RehearsalGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizationId` to the `Rehearsal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RehearsalGroup" DROP CONSTRAINT "RehearsalGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "RehearsalGroup" DROP CONSTRAINT "RehearsalGroup_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "RehearsalGroup" DROP CONSTRAINT "RehearsalGroup_rehearsalId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "rehearsalId" TEXT;

-- AlterTable
ALTER TABLE "Rehearsal" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "RehearsalGroup";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "Rehearsal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rehearsal" ADD CONSTRAINT "Rehearsal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
