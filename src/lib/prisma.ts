import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var cachedPrisma: ReturnType<typeof getPrismaClient>;
}

function getPrismaClient() {
  const client = new PrismaClient().$extends(withAccelerate());
  return client;
}

export const prisma = globalThis.cachedPrisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.cachedPrisma = prisma;
}