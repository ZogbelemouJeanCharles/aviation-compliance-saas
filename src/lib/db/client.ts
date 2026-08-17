import "server-only";
import { PrismaClient } from "@prisma/client";

// In dev, Next.js hot-reloads modules on every save, which would otherwise
// create a new PrismaClient (and a new DB connection) on every edit. Stashing
// the instance on `globalThis` survives the reload and keeps one connection.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
