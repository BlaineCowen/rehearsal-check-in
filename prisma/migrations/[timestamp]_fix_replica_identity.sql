-- Fix replica identity for auth tables
ALTER TABLE "Session" REPLICA IDENTITY FULL;
ALTER TABLE "Account" REPLICA IDENTITY FULL;
ALTER TABLE "User" REPLICA IDENTITY FULL; 