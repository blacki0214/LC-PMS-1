import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - be careful in production!)
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.notifications);
    await db.delete(schema.activityLogs);
    await db.delete(schema.inventoryTransactions);
    await db.delete(schema.orders);
    await db.delete(schema.prescriptions);
    await db.delete(schema.products);
    await db.delete(schema.customers);
    await db.delete(schema.users);

    // Seed Users
    console.log('👥 Seeding users...');
    
    // Simple password hashing function (same as in UserService)
    const hashPassword = (password: string): string => {
      return btoa(password + 'longchau-salt');
    };
    
    await db.insert(schema.users).values([
      {
        id: '1',
        email: 'pharmacist@longchau.com',
        password: hashPassword('password'),
        name: 'Dr. Nguyen Van A',
        role: 'pharmacist',
        branchId: 'branch-1',
        professionalInfo: {
          licenseNumber: 'PH-VN-12345',
          specializations: ['Clinical Pharmacy', 'Medication Therapy Management', 'Pharmacovigilance'],
          yearsOfExperience: 8,
          education: {
            degree: 'Doctor of Pharmacy (PharmD)',
            institution: 'University of Medicine and Pharmacy at Ho Chi Minh City',
            graduationYear: 2016
          },
          certifications: ['Board Certified Pharmacotherapy Specialist', 'Immunization Certified'],
          branch: {
            id: 'branch-1',
            name: 'Long Châu District 1',
            address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
            phone: '028-3824-5678'
          },
          hireDate: '2018-03-15',
          position: 'Senior Clinical Pharmacist',
          department: 'Prescription Services'
        }
      },
      {
        id: '2',
        email: 'manager@longchau.com',
        password: hashPassword('password'),
        name: 'Tran Thi B',
        role: 'manager',
        branchId: 'branch-1',
        professionalInfo: {
          licenseNumber: 'MG-VN-67890',
          specializations: ['Pharmacy Operations', 'Staff Management', 'Business Development'],
          yearsOfExperience: 12,
          education: {
            degree: 'Master of Business Administration (MBA)',
            institution: 'Ho Chi Minh City University of Economics',
            graduationYear: 2012
          },
          certifications: ['Pharmacy Management Certificate', 'Leadership Excellence Program'],
          branch: {
            id: 'branch-1',
            name: 'Long Châu District 1',
            address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
            phone: '028-3824-5678'
          },
          hireDate: '2015-01-10',
          position: 'Branch Manager',
          department: 'Operations'
        }
      },
      {
        id: '3',
        email: 'customer@gmail.com',
        password: hashPassword('password'),
        name: 'Le Van C',
        role: 'customer'
      }
    ]);

    // Seed Customers
    console.log('👤 Seeding customers...');
    await db.insert(schema.customers).values([
      {
        id: 'cust-1',
        name: 'Nguyen Van Duc',
        email: 'duc.nguyen@email.com',
        phone: '0901234567',
        address: '123 Le Loi St, District 1, Ho Chi Minh City',
        dateOfBirth: '1985-05-15',
        allergies: ['Penicillin'],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'A+',
          height: 175,
          weight: 70,
          chronicConditions: ['Hypertension'],
          emergencyContact: {
            name: 'Nguyen Thi Lan',
            phone: '0987654321',
            relationship: 'Wife'
          },
          insurance: {
            provider: 'Vietnam Social Insurance',
            policyNumber: 'VSI-2024-001',
            expiryDate: '2025-12-31'
          }
        },
        membershipTier: 'gold',
        joinDate: new Date('2020-03-15'),
        totalSpent: '2500000'
      },
      {
        id: 'cust-2',
        name: 'Tran Thi Mai',
        email: 'mai.tran@email.com',
        phone: '0912345678',
        address: '456 Nguyen Hue St, District 1, Ho Chi Minh City',
        dateOfBirth: '1990-08-22',
        allergies: [],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'O-',
          height: 160,
          weight: 55,
          chronicConditions: ['Diabetes Type 2'],
          emergencyContact: {
            name: 'Tran Van Nam',
            phone: '0976543210',
            relationship: 'Brother'
          },
          insurance: {
            provider: 'Bao Viet Insurance',
            policyNumber: 'BV-2024-456',
            expiryDate: '2025-08-22'
          }
        },
        membershipTier: 'platinum',
        joinDate: new Date('2019-01-10'),
        totalSpent: '4200000'
      },
      {
        id: '3',
        name: 'Le Van C',
        email: 'customer@gmail.com',
        phone: '0923456789',
        address: '789 Pham Ngu Lao St, District 1, Ho Chi Minh City',
        dateOfBirth: '1992-03-10',
        allergies: ['Sulfa drugs'],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'B+',
          height: 168,
          weight: 65,
          chronicConditions: [],
          emergencyContact: {
            name: 'Le Thi Hoa',
            phone: '0965432109',
            relationship: 'Mother'
          }
        },
        membershipTier: 'silver',
        joinDate: new Date('2022-06-20'),
        totalSpent: '850000'
      }
    ]);

    // Seed Products
    console.log('💊 Seeding products...');
    await db.insert(schema.products).values([
      {
        id: 'prod-1',
        name: 'Paracetamol 500mg',
        description: 'Pain reliever and fever reducer',
        category: 'Pain Relief',
        price: '25000',
        stock: 150,
        minStock: 20,
        manufacturer: 'Teva Pharmaceutical',
        expiryDate: '2025-12-31',
        requiresPrescription: false,
        batchNumber: 'PAR2024001'
      },
      {
        id: 'prod-2',
        name: 'Amoxicillin 250mg',
        description: 'Antibiotic for bacterial infections',
        category: 'Antibiotics',
        price: '45000',
        stock: 80,
        minStock: 15,
        manufacturer: 'GSK Pharmaceuticals',
        expiryDate: '2025-08-15',
        requiresPrescription: true,
        batchNumber: 'AMX2024002'
      },
      {
        id: 'prod-3',
        name: 'Vitamin C 1000mg',
        description: 'Immune system support supplement',
        category: 'Vitamins',
        price: '120000',
        stock: 200,
        minStock: 30,
        manufacturer: 'Nature Made',
        expiryDate: '2026-03-20',
        requiresPrescription: false,
        batchNumber: 'VIT2024003'
      },
      {
        id: 'prod-4',
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory and pain relief',
        category: 'Pain Relief',
        price: '35000',
        stock: 120,
        minStock: 25,
        manufacturer: 'Pfizer',
        expiryDate: '2025-11-30',
        requiresPrescription: false,
        batchNumber: 'IBU2024004'
      },
      {
        id: 'prod-5',
        name: 'Metformin 500mg',
        description: 'Diabetes medication',
        category: 'Diabetes',
        price: '55000',
        stock: 90,
        minStock: 20,
        manufacturer: 'Merck',
        expiryDate: '2025-09-15',
        requiresPrescription: true,
        batchNumber: 'MET2024005'
      }
    ]);

    // Seed Prescriptions
    console.log('📋 Seeding prescriptions...');
    await db.insert(schema.prescriptions).values([
      {
        id: 'presc-1',
        customerId: 'cust-1',
        customerName: 'Nguyen Van Duc',
        pharmacistId: '1',
        pharmacistName: 'Dr. Nguyen Van A',
        medications: [
          {
            productId: 'prod-2',
            productName: 'Amoxicillin 250mg',
            dosage: '250mg',
            frequency: '3 times daily',
            duration: '7 days',
            instructions: 'Take with food'
          }
        ],
        status: 'dispensed',
        uploadDate: new Date('2024-12-01'),
        validationDate: new Date('2024-12-01'),
        notes: 'For bacterial infection treatment',
        totalAmount: '315000'
      },
      {
        id: 'presc-2',
        customerId: 'cust-2',
        customerName: 'Tran Thi Mai',
        pharmacistId: '1',
        pharmacistName: 'Dr. Nguyen Van A',
        medications: [
          {
            productId: 'prod-5',
            productName: 'Metformin 500mg',
            dosage: '500mg',
            frequency: '2 times daily',
            duration: '30 days',
            instructions: 'Take with meals'
          }
        ],
        status: 'validated',
        uploadDate: new Date('2024-12-15'),
        validationDate: new Date('2024-12-15'),
        notes: 'Diabetes management',
        totalAmount: '1650000'
      }
    ]);

    // Seed Orders
    console.log('🛒 Seeding orders...');
    await db.insert(schema.orders).values([
      {
        id: 'order-1',
        customerId: 'cust-1',
        customerName: 'Nguyen Van Duc',
        items: [
          {
            productId: 'prod-1',
            productName: 'Paracetamol 500mg',
            quantity: 2,
            price: 25000
          },
          {
            productId: 'prod-3',
            productName: 'Vitamin C 1000mg',
            quantity: 1,
            price: 120000
          }
        ],
        total: '170000',
        status: 'delivered',
        orderDate: new Date('2024-12-10'),
        shippingAddress: '123 Le Loi St, District 1, Ho Chi Minh City',
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        trackingNumber: 'TN001234567',
        deliveryDate: new Date('2024-12-12')
      },
      {
        id: 'order-2',
        customerId: 'cust-2',
        customerName: 'Tran Thi Mai',
        items: [
          {
            productId: 'prod-4',
            productName: 'Ibuprofen 400mg',
            quantity: 1,
            price: 35000
          }
        ],
        total: '35000',
        status: 'shipped',
        orderDate: new Date('2024-12-20'),
        shippingAddress: '456 Nguyen Hue St, District 1, Ho Chi Minh City',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        trackingNumber: 'TN001234568'
      },
      {
        id: 'order-3',
        customerId: '3',
        customerName: 'Le Van C',
        items: [
          {
            productId: 'prod-1',
            productName: 'Paracetamol 500mg',
            quantity: 1,
            price: 25000
          }
        ],
        total: '25000',
        status: 'pending',
        orderDate: new Date('2024-12-25'),
        shippingAddress: '789 Pham Ngu Lao St, District 1, Ho Chi Minh City',
        paymentMethod: 'cod',
        paymentStatus: 'pending'
      }
    ]);

    // Seed Notifications
    console.log('🔔 Seeding notifications...');
    await db.insert(schema.notifications).values([
      {
        id: 'notif-1',
        userId: '1',
        type: 'success',
        title: 'New Prescription Uploaded',
        message: 'A new prescription has been uploaded by Nguyen Van Duc',
        read: false,
        createdAt: new Date('2024-12-01T10:00:00Z')
      },
      {
        id: 'notif-2',
        userId: '2',
        type: 'info',
        title: 'Order Delivered',
        message: 'Order #order-1 has been successfully delivered',
        read: true,
        createdAt: new Date('2024-12-12T15:30:00Z')
      }
    ]);

    // Seed Activity Logs
    console.log('📊 Seeding activity logs...');
    await db.insert(schema.activityLogs).values([
      {
        id: 'log-1',
        userId: '1',
        action: 'prescription_validated',
        entityType: 'prescription',
        entityId: 'presc-1',
        details: {
          prescriptionId: 'presc-1',
          customerId: 'cust-1',
          customerName: 'Nguyen Van Duc'
        },
        createdAt: new Date('2024-12-01T10:30:00Z')
      },
      {
        id: 'log-2',
        userId: '2',
        action: 'order_shipped',
        entityType: 'order',
        entityId: 'order-2',
        details: {
          orderId: 'order-2',
          customerId: 'cust-2',
          customerName: 'Tran Thi Mai'
        },
        createdAt: new Date('2024-12-21T09:15:00Z')
      }
    ]);

    // Seed Inventory Transactions
    console.log('📦 Seeding inventory transactions...');
    await db.insert(schema.inventoryTransactions).values([
      {
        id: 'inv-1',
        productId: 'prod-1',
        type: 'stock_out',
        quantity: -2,
        previousStock: 152,
        newStock: 150,
        reason: 'Customer order',
        userId: '1',
        createdAt: new Date('2024-12-10T14:00:00Z')
      },
      {
        id: 'inv-2',
        productId: 'prod-3',
        type: 'stock_out',
        quantity: -1,
        previousStock: 201,
        newStock: 200,
        reason: 'Customer order',
        userId: '1',
        createdAt: new Date('2024-12-10T14:00:00Z')
      },
      {
        id: 'inv-3',
        productId: 'prod-1',
        type: 'stock_in',
        quantity: 50,
        previousStock: 100,
        newStock: 150,
        reason: 'Weekly restock',
        userId: '2',
        createdAt: new Date('2024-12-15T08:00:00Z')
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('  - Users: 3');
    console.log('  - Customers: 3'); 
    console.log('  - Products: 5');
    console.log('  - Prescriptions: 2');
    console.log('  - Orders: 3');
    console.log('  - Notifications: 2');
    console.log('  - Activity Logs: 2');
    console.log('  - Inventory Transactions: 3');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('🎉 Seeding completed! Your database is now populated with sample data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
