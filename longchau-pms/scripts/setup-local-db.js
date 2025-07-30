// Simple local database setup using SQLite for development
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/schema';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local-pharmacy.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

console.log('🔧 Setting up local SQLite database...');
console.log(`📁 Database file: ${dbPath}`);

// Create tables
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  stock INTEGER NOT NULL,
  min_stock INTEGER NOT NULL,
  manufacturer TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  requires_prescription BOOLEAN NOT NULL,
  batch_number TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON string
  total TEXT NOT NULL,
  status TEXT NOT NULL,
  order_date TEXT NOT NULL,
  shipping_address TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  pharmacist_id TEXT,
  pharmacist_name TEXT,
  medications TEXT NOT NULL, -- JSON string
  status TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  validation_date TEXT,
  notes TEXT,
  image_url TEXT,
  total_amount TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

sqlite.exec(createTablesSQL);

console.log('✅ Local database tables created successfully!');
console.log('📝 To use this database, update your .env file with:');
console.log(`DATABASE_URL=file:${dbPath}`);
console.log('\n🎉 Local development database is ready!');

sqlite.close();
