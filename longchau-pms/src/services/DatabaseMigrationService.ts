import { CustomerDataService } from '../services/CustomerDataService';
import { db } from '../lib/db';
import { customers, orders } from '../lib/schema';
import { eq } from 'drizzle-orm';

export class DatabaseMigrationService {
  
  // Migrate existing customer health data to the new health info table
  static async migrateCustomerHealthData(): Promise<void> {
    try {
      console.log('🔄 Starting customer health data migration...');
      
      const allCustomers = await db.select().from(customers);
      
      for (const customer of allCustomers) {
        if (customer.healthStatus) {
          const healthStatus = customer.healthStatus as any;
          
          const healthData = {
            customerId: customer.id,
            bloodType: healthStatus.bloodType,
            height: healthStatus.height,
            weight: healthStatus.weight,
            allergies: customer.allergies || [],
            chronicConditions: healthStatus.chronicConditions || [],
            currentMedications: healthStatus.currentMedications || [],
            emergencyContactName: healthStatus.emergencyContact?.name,
            emergencyContactPhone: healthStatus.emergencyContact?.phone,
            emergencyContactRelationship: healthStatus.emergencyContact?.relationship,
            insuranceProvider: healthStatus.insurance?.provider,
            insurancePolicyNumber: healthStatus.insurance?.policyNumber,
          };
          
          await CustomerDataService.saveCustomerHealthInfo(healthData);
          console.log(`✅ Migrated health data for customer: ${customer.name}`);
        }
      }
      
      console.log('✅ Customer health data migration completed');
    } catch (error) {
      console.error('❌ Error migrating customer health data:', error);
    }
  }

  // Migrate existing order data to the new order items table
  static async migrateOrderData(): Promise<void> {
    try {
      console.log('🔄 Starting order data migration...');
      
      const allOrders = await db.select().from(orders);
      
      for (const order of allOrders) {
        if (order.items && order.customerId) {
          try {
            let items;
            if (typeof order.items === 'string') {
              items = JSON.parse(order.items);
            } else if (typeof order.items === 'object') {
              items = order.items;
            } else {
              continue;
            }
            
            if (Array.isArray(items)) {
              const orderItems = items.map(item => ({
                customerId: order.customerId!,
                orderId: order.id,
                productId: item.productId || item.id || `unknown-${Date.now()}`,
                productName: item.name || 'Unknown Product',
                productCategory: item.category || 'General',
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.price) || 0,
                totalPrice: (parseFloat(item.price) || 0) * (item.quantity || 1),
                therapeuticClass: item.therapeuticClass,
                activeIngredients: item.activeIngredients || [],
                orderDate: order.createdAt || new Date(),
                orderStatus: order.status || 'completed',
              }));
              
              await CustomerDataService.saveCustomerOrderItems(orderItems);
              console.log(`✅ Migrated order items for order: ${order.id}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to migrate order ${order.id}:`, error);
          }
        }
      }
      
      console.log('✅ Order data migration completed');
    } catch (error) {
      console.error('❌ Error migrating order data:', error);
    }
  }

  // Generate purchase patterns for all customers
  static async generateAllCustomerPurchasePatterns(): Promise<void> {
    try {
      console.log('🔄 Generating purchase patterns for all customers...');
      
      const allCustomers = await db.select().from(customers);
      
      for (const customer of allCustomers) {
        await CustomerDataService.updateCustomerPurchasePatterns(customer.id);
        console.log(`✅ Generated purchase patterns for customer: ${customer.name}`);
      }
      
      console.log('✅ Purchase patterns generation completed');
    } catch (error) {
      console.error('❌ Error generating purchase patterns:', error);
    }
  }

  // Run complete migration
  static async runCompleteMigration(): Promise<void> {
    console.log('🚀 Starting complete database migration...');
    
    await this.migrateCustomerHealthData();
    await this.migrateOrderData();
    await this.generateAllCustomerPurchasePatterns();
    
    console.log('🎉 Complete database migration finished!');
  }

  // Create sample health and order data for testing
  static async createSampleDataForCustomer(customerEmail: string): Promise<void> {
    try {
      console.log('🔄 Creating sample data for customer:', customerEmail);
      
      // Find customer by email
      const customerResult = await db.select()
        .from(customers)
        .where(eq(customers.email, customerEmail))
        .limit(1);
        
      if (customerResult.length === 0) {
        console.log('❌ Customer not found with email:', customerEmail);
        return;
      }
      
      const customer = customerResult[0];
      
      // Create sample health data
      const healthData = {
        customerId: customer.id,
        bloodType: 'A+',
        height: 170,
        weight: 70,
        allergies: ['Penicillin', 'Shellfish'],
        chronicConditions: ['Hypertension', 'Diabetes Type 2'],
        currentMedications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: '2024-01-15',
            prescribedBy: 'Dr. Smith'
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            startDate: '2024-02-01',
            prescribedBy: 'Dr. Johnson'
          }
        ],
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+84 123 456 789',
        emergencyContactRelationship: 'spouse',
        insuranceProvider: 'Vietnam Health Insurance',
        insurancePolicyNumber: 'VHI123456789',
      };
      
      await CustomerDataService.saveCustomerHealthInfo(healthData);
      
      // Create sample orders first (to satisfy foreign key constraints)
      const timestamp = Date.now();
      const sampleOrders = [
        {
          id: `order-${timestamp}-1`,
          customerId: customer.id,
          customerName: customer.name,
          items: JSON.stringify([{
            productId: 'prod-lisinopril',
            name: 'Lisinopril 10mg',
            price: '25000',
            quantity: 30
          }]),
          total: '750000',
          status: 'completed',
          shippingAddress: '123 Main Street, Ho Chi Minh City',
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: `order-${timestamp}-2`,
          customerId: customer.id,
          customerName: customer.name,
          items: JSON.stringify([{
            productId: 'prod-metformin',
            name: 'Metformin 500mg',
            price: '15000',
            quantity: 60
          }]),
          total: '900000',
          status: 'completed',
          shippingAddress: '123 Main Street, Ho Chi Minh City',
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: `order-${timestamp}-3`,
          customerId: customer.id,
          customerName: customer.name,
          items: JSON.stringify([{
            productId: 'prod-vitamin-d',
            name: 'Vitamin D3 1000IU',
            price: '35000',
            quantity: 30
          }]),
          total: '1050000',
          status: 'completed',
          shippingAddress: '123 Main Street, Ho Chi Minh City',
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }
      ];
      
      // Insert sample orders
      await db.insert(orders).values(sampleOrders);
      console.log('✅ Created sample orders');
      
      // Create sample order items
      const sampleOrderItems = [
        {
          customerId: customer.id,
          orderId: `order-${timestamp}-1`,
          productId: 'prod-lisinopril',
          productName: 'Lisinopril 10mg',
          productCategory: 'Cardiovascular',
          quantity: 30,
          unitPrice: 25000,
          totalPrice: 750000,
          therapeuticClass: 'ACE Inhibitor',
          activeIngredients: ['Lisinopril'],
          orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          orderStatus: 'completed',
        },
        {
          customerId: customer.id,
          orderId: `order-${timestamp}-2`,
          productId: 'prod-metformin',
          productName: 'Metformin 500mg',
          productCategory: 'Diabetes',
          quantity: 60,
          unitPrice: 15000,
          totalPrice: 900000,
          therapeuticClass: 'Biguanide',
          activeIngredients: ['Metformin HCl'],
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          orderStatus: 'completed',
        },
        {
          customerId: customer.id,
          orderId: `order-${timestamp}-3`,
          productId: 'prod-vitamin-d',
          productName: 'Vitamin D3 1000IU',
          productCategory: 'Vitamins',
          quantity: 30,
          unitPrice: 35000,
          totalPrice: 1050000,
          therapeuticClass: 'Vitamin Supplement',
          activeIngredients: ['Cholecalciferol'],
          orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          orderStatus: 'completed',
        }
      ];
      
      await CustomerDataService.saveCustomerOrderItems(sampleOrderItems);
      
      // Generate purchase patterns
      await CustomerDataService.updateCustomerPurchasePatterns(customer.id);
      
      console.log('✅ Sample data created successfully for customer:', customer.name);
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
    }
  }
}
