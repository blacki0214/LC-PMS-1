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

async function addMoreProducts() {
  console.log('🛒 Adding more products to the shop...');

  try {
    // Add more diverse pharmaceutical products
    await db.insert(schema.products).values([
      // Pain Relief & Anti-inflammatory
      {
        id: 'prod-6',
        name: 'Aspirin 100mg',
        description: 'Low-dose aspirin for cardiovascular protection',
        category: 'Pain Relief',
        price: '18000',
        stock: 180,
        minStock: 25,
        manufacturer: 'Bayer',
        expiryDate: '2025-10-15',
        requiresPrescription: false,
        batchNumber: 'ASP2024006'
      },
      {
        id: 'prod-7',
        name: 'Diclofenac 50mg',
        description: 'Anti-inflammatory for joint pain and arthritis',
        category: 'Pain Relief',
        price: '42000',
        stock: 95,
        minStock: 20,
        manufacturer: 'Novartis',
        expiryDate: '2025-09-30',
        requiresPrescription: true,
        batchNumber: 'DCL2024007'
      },
      
      // Vitamins & Supplements
      {
        id: 'prod-8',
        name: 'Vitamin D3 1000IU',
        description: 'Bone health and immune system support',
        category: 'Vitamins',
        price: '95000',
        stock: 150,
        minStock: 30,
        manufacturer: 'Nature Made',
        expiryDate: '2026-05-20',
        requiresPrescription: false,
        batchNumber: 'VD32024008'
      },
      {
        id: 'prod-9',
        name: 'Multivitamin Complex',
        description: 'Complete daily vitamin and mineral supplement',
        category: 'Vitamins',
        price: '180000',
        stock: 120,
        minStock: 25,
        manufacturer: 'Centrum',
        expiryDate: '2026-07-10',
        requiresPrescription: false,
        batchNumber: 'MVC2024009'
      },
      {
        id: 'prod-10',
        name: 'Omega-3 Fish Oil',
        description: 'Heart health and brain function support',
        category: 'Vitamins',
        price: '220000',
        stock: 80,
        minStock: 15,
        manufacturer: 'Nordic Naturals',
        expiryDate: '2026-02-28',
        requiresPrescription: false,
        batchNumber: 'OM32024010'
      },
      
      // Digestive Health
      {
        id: 'prod-11',
        name: 'Omeprazole 20mg',
        description: 'Proton pump inhibitor for acid reflux and ulcers',
        category: 'Digestive',
        price: '65000',
        stock: 110,
        minStock: 20,
        manufacturer: 'AstraZeneca',
        expiryDate: '2025-11-15',
        requiresPrescription: true,
        batchNumber: 'OME2024011'
      },
      {
        id: 'prod-12',
        name: 'Probiotics Multi-strain',
        description: 'Digestive health and gut microbiome support',
        category: 'Digestive',
        price: '285000',
        stock: 70,
        minStock: 15,
        manufacturer: 'Culturelle',
        expiryDate: '2025-12-31',
        requiresPrescription: false,
        batchNumber: 'PRB2024012'
      },
      
      // Respiratory Health
      {
        id: 'prod-13',
        name: 'Salbutamol Inhaler',
        description: 'Bronchodilator for asthma and COPD',
        category: 'Respiratory',
        price: '125000',
        stock: 60,
        minStock: 10,
        manufacturer: 'GSK',
        expiryDate: '2025-08-20',
        requiresPrescription: true,
        batchNumber: 'SAL2024013'
      },
      {
        id: 'prod-14',
        name: 'Loratadine 10mg',
        description: 'Antihistamine for allergies and hay fever',
        category: 'Respiratory',
        price: '35000',
        stock: 140,
        minStock: 25,
        manufacturer: 'Claritin',
        expiryDate: '2025-12-15',
        requiresPrescription: false,
        batchNumber: 'LOR2024014'
      },
      
      // Cardiovascular
      {
        id: 'prod-15',
        name: 'Amlodipine 5mg',
        description: 'Calcium channel blocker for hypertension',
        category: 'Cardiovascular',
        price: '48000',
        stock: 85,
        minStock: 15,
        manufacturer: 'Pfizer',
        expiryDate: '2025-10-30',
        requiresPrescription: true,
        batchNumber: 'AML2024015'
      },
      {
        id: 'prod-16',
        name: 'Atorvastatin 20mg',
        description: 'Statin for cholesterol management',
        category: 'Cardiovascular',
        price: '75000',
        stock: 90,
        minStock: 18,
        manufacturer: 'Lipitor',
        expiryDate: '2025-09-25',
        requiresPrescription: true,
        batchNumber: 'ATO2024016'
      },
      
      // Diabetes Management
      {
        id: 'prod-17',
        name: 'Glimepiride 2mg',
        description: 'Sulfonylurea for type 2 diabetes',
        category: 'Diabetes',
        price: '52000',
        stock: 75,
        minStock: 15,
        manufacturer: 'Sanofi',
        expiryDate: '2025-11-30',
        requiresPrescription: true,
        batchNumber: 'GLI2024017'
      },
      {
        id: 'prod-18',
        name: 'Blood Glucose Test Strips',
        description: 'Test strips for blood glucose monitoring',
        category: 'Diabetes',
        price: '320000',
        stock: 45,
        minStock: 10,
        manufacturer: 'OneTouch',
        expiryDate: '2025-12-31',
        requiresPrescription: false,
        batchNumber: 'BGS2024018'
      },
      
      // Topical & Skincare
      {
        id: 'prod-19',
        name: 'Hydrocortisone Cream 1%',
        description: 'Topical corticosteroid for skin inflammation',
        category: 'Topical',
        price: '38000',
        stock: 100,
        minStock: 20,
        manufacturer: 'Johnson & Johnson',
        expiryDate: '2025-08-30',
        requiresPrescription: false,
        batchNumber: 'HYD2024019'
      },
      {
        id: 'prod-20',
        name: 'Sunscreen SPF 50+',
        description: 'Broad spectrum UV protection',
        category: 'Topical',
        price: '165000',
        stock: 120,
        minStock: 25,
        manufacturer: 'La Roche-Posay',
        expiryDate: '2026-06-15',
        requiresPrescription: false,
        batchNumber: 'SUN2024020'
      },
      
      // Women's Health
      {
        id: 'prod-21',
        name: 'Folic Acid 5mg',
        description: 'Essential for pregnancy and cell division',
        category: 'Women\'s Health',
        price: '25000',
        stock: 160,
        minStock: 30,
        manufacturer: 'Nature Made',
        expiryDate: '2026-03-15',
        requiresPrescription: false,
        batchNumber: 'FOL2024021'
      },
      {
        id: 'prod-22',
        name: 'Iron Supplement 65mg',
        description: 'Iron supplement for anemia prevention',
        category: 'Women\'s Health',
        price: '85000',
        stock: 110,
        minStock: 20,
        manufacturer: 'Feroglobin',
        expiryDate: '2025-12-20',
        requiresPrescription: false,
        batchNumber: 'IRN2024022'
      },
      
      // Traditional Medicine
      {
        id: 'prod-23',
        name: 'Ginseng Extract',
        description: 'Traditional herbal supplement for energy',
        category: 'Traditional',
        price: '195000',
        stock: 65,
        minStock: 12,
        manufacturer: 'Korean Red Ginseng',
        expiryDate: '2025-10-10',
        requiresPrescription: false,
        batchNumber: 'GIN2024023'
      },
      {
        id: 'prod-24',
        name: 'Turmeric Curcumin',
        description: 'Anti-inflammatory herbal supplement',
        category: 'Traditional',
        price: '145000',
        stock: 85,
        minStock: 15,
        manufacturer: 'Nature\'s Way',
        expiryDate: '2025-11-25',
        requiresPrescription: false,
        batchNumber: 'TUR2024024'
      },
      
      // First Aid
      {
        id: 'prod-25',
        name: 'Betadine Antiseptic',
        description: 'Povidone iodine for wound disinfection',
        category: 'First Aid',
        price: '42000',
        stock: 130,
        minStock: 25,
        manufacturer: 'Mundipharma',
        expiryDate: '2025-12-31',
        requiresPrescription: false,
        batchNumber: 'BET2024025'
      }
    ]);

    console.log('✅ Successfully added 20 new products to the shop!');
    
    // Show summary
    const totalProducts = await db.select().from(schema.products);
    console.log(`\n📊 Shop Summary:`);
    console.log(`Total Products: ${totalProducts.length}`);
    
    // Count by category
    const categories = totalProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📦 Products by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
    console.log('\n🛒 New Product Categories Added:');
    console.log('  • Digestive Health');
    console.log('  • Respiratory Health');
    console.log('  • Cardiovascular');
    console.log('  • Diabetes Management');
    console.log('  • Topical & Skincare');
    console.log('  • Women\'s Health');
    console.log('  • Traditional Medicine');
    console.log('  • First Aid');

  } catch (error) {
    console.error('❌ Error adding products:', error);
    process.exit(1);
  }
}

// Run the product addition
addMoreProducts()
  .then(() => {
    console.log('\n🎉 Shop expansion completed! Your pharmacy now has a full product catalog.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Product addition failed:', error);
    process.exit(1);
  });
