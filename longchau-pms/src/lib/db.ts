import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Get database URL from environment variables
// In browser (Vite), use import.meta.env
const databaseUrl = import.meta.env?.VITE_DATABASE_URL;

if (!databaseUrl) {
  const error = 'Database URL not configured. Please check your .env file and ensure VITE_DATABASE_URL is set.';
  console.error('❌', error);
  console.log('🔍 Available env vars:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_DATABASE_URL: import.meta.env.VITE_DATABASE_URL ? 'Present' : 'Missing'
  });
  throw new Error(error);
}

// Create the Neon connection
const sql = neon(databaseUrl);

// Create the Drizzle instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;
