-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkOutTime" TIMESTAMP(3),
ALTER COLUMN "checkInTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rehearsal" ADD COLUMN     "checkOut" BOOLEAN NOT NULL DEFAULT false;
