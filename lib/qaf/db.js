import { PrismaClient } from "@prisma/client";

// Prisma singleton (globalThis guard survives Next dev hot-reload).
// Works against SQLite locally and Postgres (Neon) on Vercel —
// same models, provider chosen by DATABASE_URL.

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__qafPrisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__qafPrisma = prisma;
