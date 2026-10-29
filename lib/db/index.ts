import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/electricity_db';

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

// Guarantee UTF-8 client encoding for all pooled connections across full system
pool.on('connect', (client) => {
  client.query("SET client_encoding TO 'UTF8';").catch((err) => {
    console.error('Failed to set client_encoding to UTF8', err);
  });
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
