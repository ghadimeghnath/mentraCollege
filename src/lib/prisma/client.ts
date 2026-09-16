import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// Strip ?sslmode=verify-full so node-postgres can connect to Supabase pooler without TLS cert verification errors
connectionString = connectionString.replace('?sslmode=verify-full', '');

// If connecting to Supabase pooler in session mode (port 5432), switch to transaction mode (port 6543)
// to prevent EMAXCONNSESSION max clients reached in session mode
if (connectionString.includes('pooler.supabase.com:5432')) {
  connectionString = connectionString.replace(':5432', ':6543');
}

const isLocalhost =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('sslmode=disable');

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pool =
  globalForPrisma.pgPool ||
  new Pool({
    connectionString,
    max: 10, // Prevent exhausting Supabase pool connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}