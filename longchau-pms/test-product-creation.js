import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/lib/schema.js';

// Use the database URL directly for testing
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ft5wrU2equCd@ep-dry-breeze-a15awvf5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function testProductCreation() {
  console.log('🧪 Testing Product Creation');
  console.log('===========================');
  
  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const healthCheck = await db.select({ count: 1 }).from(schema.users).limit(1);
    console.log('Database health:', healthCheck ? '✅ Connected' : '❌ Failed');
    
    // Test creating a product
    console.log('\n📦 Testing product creation...');
    const testProduct = {
      id: `test-product-${Date.now()}`,
      name: 'Test Medicine for Database',
      description: 'This is a test product to verify database integration',
      category: 'Medicines',
      price: '50000',
      stock: 100,
      minStock: 10,
      manufacturer: 'Test Pharma Co.',
      expiryDate: '2025-12-31',
      requiresPrescription: false,
      batchNumber: `BATCH-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Product data to create:', {
      id: testProduct.id,
      name: testProduct.name,
      category: testProduct.category,
      price: testProduct.price,
      stock: testProduct.stock
    });
    
    const result = await db.insert(schema.products).values(testProduct).returning();
    
    if (result && result.length > 0) {
      console.log('✅ Product created successfully!');
      console.log('Created product:', {
        id: result[0].id,
        name: result[0].name,
        category: result[0].category,
        price: result[0].price,
        stock: result[0].stock
      });
      
      // Verify by getting all products
      console.log('\n📋 Verifying by fetching all products...');
      const allProducts = await db.select().from(schema.products);
      console.log(`Total products in database: ${allProducts.length}`);
      
      const createdProduct = allProducts.find(p => p.id === testProduct.id);
      if (createdProduct) {
        console.log('✅ Product found in database after creation!');
      } else {
        console.log('❌ Product not found in database after creation.');
      }
      
    } else {
      console.log('❌ Product creation failed - no result returned');
    }
    
  } catch (error) {
    console.error('❌ Error during product creation test:', error);
  }
}

testProductCreation().then(() => {
  console.log('\n✅ Product creation test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Product creation test failed:', error);
  process.exit(1);
});
