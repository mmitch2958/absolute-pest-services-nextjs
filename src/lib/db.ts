import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { WebSocket } from 'ws';
import * as schema from '../../shared/schema';

// Configure WebSocket constructor for Neon serverless driver (for pgwire/TCP connections if ever used)
neonConfig.webSocketConstructor = WebSocket;

// Raw Neon SQL client — use for simple queries and cron jobs
const sql = neon(process.env.DATABASE_URL!);

// Drizzle ORM client — use for typed queries with the schema
const db = drizzle(sql, { schema });

export { sql, db };
export type DB = typeof db;
