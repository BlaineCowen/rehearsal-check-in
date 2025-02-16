/*
  Warnings:

  - You are about to drop the column `groupId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_groupId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "_StudentToGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentToGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentToGroup_B_index" ON "_StudentToGroup"("B");

-- AddForeignKey
ALTER TABLE "_StudentToGroup" ADD CONSTRAINT "_StudentToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToGroup" ADD CONSTRAINT "_StudentToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
