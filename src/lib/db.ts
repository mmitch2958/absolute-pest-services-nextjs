import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { WebSocket } from 'ws';
import * as schema from '../../shared/schema';

// Configure WebSocket constructor for Neon serverless driver (for pgwire/TCP connections if ever used)
neonConfig.webSocketConstructor = WebSocket;

// Raw Neon SQL client (used internally by drizzle and wrapped by `sql` below)
const _rawSql = neon(process.env.DATABASE_URL!);

// Drizzle ORM client — use for typed queries with the schema
const db = drizzle(_rawSql, { schema });

/**
 * Wrapped Neon tagged-template `sql`.
 *
 * Works around a bug in @neondatabase/serverless v1.1.0 where the HTTP
 * endpoint returns `rows: null` (instead of `[]`) for empty result sets,
 * causing the driver to throw "Cannot read properties of null (reading 'map')".
 * We catch that specific failure and return an empty array.
 */
const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  const promise = (_rawSql as any)(strings, ...values);
  return promise.catch((err: any) => {
    if (err?.message?.includes("Cannot read properties of null (reading 'map')")) {
      return [];
    }
    throw err;
  });
}) as unknown as typeof _rawSql;

export { sql, db };
export type DB = typeof db;
