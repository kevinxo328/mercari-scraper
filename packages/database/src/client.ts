import { createRequire } from 'module';

// Use createRequire to load the CJS Prisma generated client, avoiding
// ESM/CJS named export interop issues when running under tsx or Node.js ESM.
const _require = createRequire(import.meta.url);
const { PrismaClient } = _require(
  '../generated/client'
) as typeof import('../generated/client');

const globalForPrisma = global as unknown as {
  prisma: import('../generated/client').PrismaClient;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Type-only re-export: stripped at runtime, so no CJS/ESM interop issue.
export type * from '../generated/client';
export * from './categories';
