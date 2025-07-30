import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Get database URL from environment variables
// In browser (Vite), use import.meta.env; in Node.js, use process.env
const databaseUrl = typeof window !== 'undefined' 
  ? import.meta.env?.VITE_DATABASE_URL
  : process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  const error = 'Database URL not configured. Please check your .env file.';
  console.error('❌', error);
  throw new Error(error);
}

// Create the Neon connection
const sql = neon(databaseUrl);

// Create the Drizzle instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;
