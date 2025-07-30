// Database verification script to check if data is properly loaded
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Load environment variables FIRST
dotenv.config();

async function verifyDatabase() {
  console.log('🔍 Verifying database data...');
  
  const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  console.log('Database URL found:', databaseUrl ? 'Yes' : 'No');
  
  if (!databaseUrl) {
    console.log('❌ No database URL found in environment variables');
    return;
  }
  
  try {
    // Create direct database connection
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });
    
    // Test connection by querying products
    const products = await db.select().from(schema.products);
    console.log(`📊 Database Health: ✅ Connected`);
    console.log(`📦 Total Products: ${products.length}`);
    
    // Show some sample products
    if (products.length > 0) {
      console.log('\n🏷️  Sample Products:');
      products.slice(0, 5).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.category} - ₫${product.price}`);
      });
      
      if (products.length > 5) {
        console.log(`  ... and ${products.length - 5} more products`);
      }
    }
    
    console.log('\n✅ Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

verifyDatabase();
