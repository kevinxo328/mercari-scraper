import { PrismaClient } from '@mercari-scraper/db';
import * as DBModule from '@mercari-scraper/db';

const globalForDbClient = global as unknown as { dbClent: PrismaClient };

export const dbClient = globalForDbClient.dbClent || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForDbClient.dbClent = dbClient;

const { PrismaClient: _ignored, ...db } = DBModule;
export { db };
