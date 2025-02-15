import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    const test = await prisma.$connect()
    console.log('Database connection successful! ✅')
  } catch (error) {
    console.error('Failed to connect to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 