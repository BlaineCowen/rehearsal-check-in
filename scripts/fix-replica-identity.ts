const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixReplicaIdentity() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Session" REPLICA IDENTITY FULL`;
    await prisma.$executeRaw`ALTER TABLE "Account" REPLICA IDENTITY FULL`;
    await prisma.$executeRaw`ALTER TABLE "User" REPLICA IDENTITY FULL`;
    console.log('Successfully updated replica identity');
  } catch (error) {
    console.error('Error updating replica identity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReplicaIdentity(); 