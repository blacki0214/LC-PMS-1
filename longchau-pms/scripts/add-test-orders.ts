import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Directly use the database URL from the .env file
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ft5wrU2equCd@ep-dry-breeze-a15awvf5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function addTestOrders() {
  console.log('📦 Adding Test Orders to Database');
  console.log('==================================');

  try {
    // Get existing users and products for reference
    const users = await db.select().from(schema.users);
    const products = await db.select().from(schema.products).limit(5);

    console.log('📋 Found users:', users.length);
    console.log('📦 Found products:', products.length);

    const testOrders = [
      {
        id: `ORD-${Date.now()}-TEST1`,
        customerId: users.find(u => u.role === 'customer')?.id || 'customer-test',
        customerName: users.find(u => u.role === 'customer')?.name || 'Test Customer',
        items: [
          {
            productId: products[0]?.id || 'prod-1',
            productName: products[0]?.name || 'Paracetamol 500mg',
            quantity: 2,
            price: parseFloat(products[0]?.price || '25000')
          },
          {
            productId: products[1]?.id || 'prod-2', 
            productName: products[1]?.name || 'Vitamin C 1000mg',
            quantity: 1,
            price: parseFloat(products[1]?.price || '150000')
          }
        ],
        total: '200000',
        status: 'pending' as const,
        orderDate: new Date(),
        shippingAddress: '123 Nguyen Trai Street, District 1, Ho Chi Minh City',
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `ORD-${Date.now()}-TEST2`,
        customerId: users.find(u => u.role === 'customer')?.id || 'customer-test',
        customerName: users.find(u => u.role === 'customer')?.name || 'Test Customer',
        items: [
          {
            productId: products[2]?.id || 'prod-3',
            productName: products[2]?.name || 'Omega 3 Fish Oil',
            quantity: 1,
            price: parseFloat(products[2]?.price || '320000')
          }
        ],
        total: '320000',
        status: 'confirmed' as const,
        orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        shippingAddress: '456 Le Loi Street, District 3, Ho Chi Minh City',
        paymentMethod: 'card' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: `ORD-${Date.now()}-TEST3`,
        customerId: users.find(u => u.role === 'customer')?.id || 'customer-test',
        customerName: users.find(u => u.role === 'customer')?.name || 'Test Customer',
        items: [
          {
            productId: products[3]?.id || 'prod-4',
            productName: products[3]?.name || 'Calcium + D3',
            quantity: 3,
            price: parseFloat(products[3]?.price || '85000')
          },
          {
            productId: products[4]?.id || 'prod-5',
            productName: products[4]?.name || 'Multivitamin Complex',
            quantity: 1,
            price: parseFloat(products[4]?.price || '180000')
          }
        ],
        total: '435000',
        status: 'shipped' as const,
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        shippingAddress: '789 Hai Ba Trung Street, District 1, Ho Chi Minh City',
        paymentMethod: 'bank_transfer' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: `ORD-${Date.now()}-TEST4`,
        customerId: users.find(u => u.role === 'customer')?.id || 'customer-test',
        customerName: users.find(u => u.role === 'customer')?.name || 'Test Customer',
        items: [
          {
            productId: products[0]?.id || 'prod-1',
            productName: products[0]?.name || 'Paracetamol 500mg',
            quantity: 5,
            price: parseFloat(products[0]?.price || '25000')
          }
        ],
        total: '125000',
        status: 'delivered' as const,
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        shippingAddress: '321 Dong Khoi Street, District 1, Ho Chi Minh City',
        paymentMethod: 'cod' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    console.log('\n🔄 Creating test orders...');

    for (const order of testOrders) {
      console.log(`\n📦 Creating order: ${order.id}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: ₫${parseInt(order.total).toLocaleString()}`);
      console.log(`   Items: ${order.items.length}`);

      try {
        const result = await db.insert(schema.orders).values(order).returning({ id: schema.orders.id });
        console.log(`   ✅ Order created successfully! ID: ${result[0].id}`);
      } catch (error: any) {
        if (error.message.includes('unique constraint')) {
          console.log(`   ⚠️ Order ${order.id} already exists, skipping...`);
        } else {
          console.log(`   ❌ Failed to create order: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Test order creation completed!');
    
    // Show summary
    const allOrders = await db.select({
      id: schema.orders.id,
      customerName: schema.orders.customerName,
      status: schema.orders.status,
      total: schema.orders.total,
      orderDate: schema.orders.orderDate
    }).from(schema.orders);

    console.log('\n📊 All Orders in Database:');
    allOrders.forEach((order: any, index) => {
      const statusIcon = order.status === 'pending' ? '🕐' : 
                        order.status === 'confirmed' ? '📦' : 
                        order.status === 'shipped' ? '🚚' : 
                        order.status === 'delivered' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${statusIcon} ${order.id} - ${order.customerName} - ${order.status} - ₫${parseInt(order.total).toLocaleString()}`);
    });

    console.log('\n💡 Test Instructions:');
    console.log('   1. Login as pharmacist or manager to manage orders');
    console.log('   2. Login as customer to view your orders');
    console.log('   3. Test order status updates and database persistence');
    console.log('   4. View order details and manage workflow');

  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  }
}

addTestOrders().then(() => {
  console.log('✅ Test order creation process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test order creation process failed:', error);
  process.exit(1);
});
