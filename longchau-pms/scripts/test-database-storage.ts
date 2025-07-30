import { DatabaseStorageService } from '../src/services/DatabaseStorageService';
import { config } from 'dotenv';

// Load environment variables
config();

async function testDatabaseOperations() {
  console.log('🧪 Testing Database Storage Operations...\n');

  try {
    // Test 1: Store a test order
    console.log('1️⃣ Testing Order Storage:');
    const testOrder = {
      customerId: 'test-customer-1',
      customerName: 'Test Customer',
      items: [
        {
          productId: 'prod-1',
          productName: 'Test Medicine',
          quantity: 2,
          price: 50000
        }
      ],
      total: 100000,
      status: 'pending' as const,
      orderDate: new Date().toISOString(),
      shippingAddress: 'Test Address',
      paymentMethod: 'cod' as const,
      paymentStatus: 'pending' as const
    };

    const orderResult = await DatabaseStorageService.storeOrder(testOrder);
    console.log(`   Result: ${orderResult.success ? '✅' : '❌'} ${orderResult.stored}`);
    if (orderResult.error) console.log(`   Error: ${orderResult.error}`);

    // Test 2: Store a test prescription
    console.log('\n2️⃣ Testing Prescription Storage:');
    const testPrescription = {
      customerId: 'test-customer-1',
      customerName: 'Test Customer',
      medications: [
        {
          productId: 'prod-1',
          productName: 'Test Medicine',
          dosage: '500mg',
          quantity: 1,
          instructions: 'Take twice daily'
        }
      ],
      status: 'pending' as const,
      uploadDate: new Date().toISOString(),
      imageUrl: 'test-image-url'
    };

    const prescriptionResult = await DatabaseStorageService.storePrescription(testPrescription);
    console.log(`   Result: ${prescriptionResult.success ? '✅' : '❌'} ${prescriptionResult.stored}`);
    if (prescriptionResult.error) console.log(`   Error: ${prescriptionResult.error}`);

    // Test 3: Check pending operations
    console.log('\n3️⃣ Testing Pending Operations:');
    const pendingCount = DatabaseStorageService.getPendingOperationsCount();
    console.log(`   Pending Operations: ${pendingCount}`);

    const pendingSummary = DatabaseStorageService.getPendingOperationsSummary();
    console.log(`   Orders Pending: ${pendingSummary.orders}`);
    console.log(`   Prescriptions Pending: ${pendingSummary.prescriptions}`);
    console.log(`   Total Pending: ${pendingSummary.total}`);

    // Test 4: Try to sync pending operations
    if (pendingCount > 0) {
      console.log('\n4️⃣ Testing Sync Operations:');
      const syncResult = await DatabaseStorageService.syncToDatabase();
      console.log(`   Sync Result: ${syncResult.success ? '✅' : '❌'} ${syncResult.stored}`);
      if (syncResult.error) console.log(`   Sync Error: ${syncResult.error}`);
      
      const newPendingCount = DatabaseStorageService.getPendingOperationsCount();
      console.log(`   Remaining Pending: ${newPendingCount}`);
    }

    console.log('\n🎉 Database Storage Test Completed!');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

// Run the test
testDatabaseOperations().catch(console.error);
