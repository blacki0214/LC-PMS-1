// Script to sync mock data from app to database
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Database URL not found in environment variables');
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

// All 25 products that should be in the database
const allProducts = [
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
    manufacturer: 'GlaxoSmithKline',
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
    expiryDate: '2026-06-30',
    requiresPrescription: false,
    batchNumber: 'VTC2024003'
  },
  {
    id: 'prod-4',
    name: 'Ibuprofen 400mg',
    description: 'Non-steroidal anti-inflammatory drug',
    category: 'Pain Relief',
    price: '35000',
    stock: 120,
    minStock: 25,
    manufacturer: 'Advil',
    expiryDate: '2025-09-15',
    requiresPrescription: false,
    batchNumber: 'IBU2024004'
  },
  {
    id: 'prod-5',
    name: 'Cough Syrup',
    description: 'Relieves cough and throat irritation',
    category: 'Respiratory',
    price: '55000',
    stock: 90,
    minStock: 20,
    manufacturer: 'Robitussin',
    expiryDate: '2025-11-20',
    requiresPrescription: false,
    batchNumber: 'CS2024005'
  },
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
  {
    id: 'prod-21',
    name: 'Folic Acid 5mg',
    description: 'Essential for pregnancy and cell division',
    category: "Women's Health",
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
    category: "Women's Health",
    price: '85000',
    stock: 110,
    minStock: 20,
    manufacturer: 'Feroglobin',
    expiryDate: '2025-12-20',
    requiresPrescription: false,
    batchNumber: 'IRN2024022'
  },
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
    manufacturer: "Nature's Way",
    expiryDate: '2025-11-25',
    requiresPrescription: false,
    batchNumber: 'TUR2024024'
  },
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
];

async function syncMockDataToDatabase() {
  console.log('🔄 Syncing mock data to database...');
  
  try {
    // Clear existing products first
    console.log('🗑️  Clearing existing products...');
    await db.delete(schema.products);
    
    // Insert all products
    console.log('📦 Inserting 25 products...');
    await db.insert(schema.products).values(allProducts);
    
    console.log('✅ Successfully synced all products to database!');
    console.log(`📊 Total products in database: ${allProducts.length}`);
    
    // Verify the sync
    const dbProducts = await db.select().from(schema.products);
    console.log(`✅ Verification: Found ${dbProducts.length} products in database`);
    
    if (dbProducts.length > 0) {
      console.log('\n🏷️  Sample products in database:');
      dbProducts.slice(0, 5).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.category} - ₫${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error syncing data to database:', error);
    throw error;
  }
}

syncMockDataToDatabase()
  .then(() => {
    console.log('\n🎉 Data sync completed! Your database is now populated with all 25 products.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  });
