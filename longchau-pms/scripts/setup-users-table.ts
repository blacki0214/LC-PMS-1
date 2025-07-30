import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Directly use the database URL from the .env file
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ft5wrU2equCd@ep-dry-breeze-a15awvf5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function checkAndSetupUsersTable() {
  console.log('🔍 Checking users table structure...');

  try {
    // Try to query the users table
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Users table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check if password column exists
    const hasPassword = result.rows.some(row => row.column_name === 'password');
    
    if (!hasPassword) {
      console.log('⚠️ Password column is missing, adding it now...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'changeme';
      `);
      console.log('✅ Password column added successfully!');
    } else {
      console.log('✅ Password column already exists!');
    }

    // Check current users
    const users = await db.execute('SELECT id, email, name, role FROM users LIMIT 5;');
    console.log(`📊 Current users count: ${users.rows.length}`);
    users.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error checking users table:', error);
  }
}

checkAndSetupUsersTable().then(() => {
  console.log('✅ Table setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Table setup failed:', error);
  process.exit(1);
});
