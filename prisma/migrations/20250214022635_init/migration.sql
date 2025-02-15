-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "grade" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rehearsal" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rehearsal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RehearsalGroup" (
    "rehearsalId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "RehearsalGroup_pkey" PRIMARY KEY ("rehearsalId","groupId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rehearsalId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_rehearsalId_key" ON "Attendance"("studentId", "rehearsalId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rehearsal" ADD CONSTRAINT "Rehearsal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehearsalGroup" ADD CONSTRAINT "RehearsalGroup_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "Rehearsal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehearsalGroup" ADD CONSTRAINT "RehearsalGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "Rehearsal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
