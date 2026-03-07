import 'dotenv/config';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    // DATABASE_URL is not required during `prisma generate` (schema → client
    // type generation). Fallback to empty string so CI/Vercel build steps
    // that only run generate don't fail on a missing env var.
    url: process.env.DATABASE_URL ?? ''
  }
});
