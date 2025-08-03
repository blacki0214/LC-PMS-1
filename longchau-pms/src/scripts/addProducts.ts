import { db } from '../lib/db';
import { products } from '../lib/schema';

// Simple ID generator
function generateId(): string {
  return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export async function addManyProducts() {
  const sampleProducts = [
    // Pain Relief & Anti-inflammatory
    {
      name: "Ibuprofen 400mg Tablets",
      description: "Fast-acting pain relief for headaches, muscle pain, and inflammation. Contains 400mg ibuprofen per tablet.",
      category: "Pain Relief",
      price: "12.99",
      stock: 250,
      minStock: 50,
      manufacturer: "Advil",
      expiryDate: "2026-12-31",
      requiresPrescription: false,
      batchNumber: "IBU240301"
    },
    {
      name: "Acetaminophen 500mg Tablets",
      description: "Effective pain reliever and fever reducer. Safe for most adults and children over 12.",
      category: "Pain Relief",
      price: "8.99",
      stock: 300,
      minStock: 60,
      manufacturer: "Tylenol",
      expiryDate: "2026-11-30",
      requiresPrescription: false,
      batchNumber: "ACE240201"
    },
    {
      name: "Naproxen 220mg Tablets",
      description: "Long-lasting relief from minor aches and pains. Lasts up to 12 hours.",
      category: "Pain Relief",
      price: "15.49",
      stock: 180,
      minStock: 40,
      manufacturer: "Aleve",
      expiryDate: "2027-01-15",
      requiresPrescription: false,
      batchNumber: "NAP240401"
    },
    {
      name: "Aspirin 81mg Low Dose",
      description: "Low-dose aspirin for heart health and stroke prevention. Enteric coated.",
      category: "Cardiovascular",
      price: "9.99",
      stock: 400,
      minStock: 80,
      manufacturer: "Bayer",
      expiryDate: "2026-10-31",
      requiresPrescription: false,
      batchNumber: "ASP240101"
    },
    // Cold & Flu
    {
      name: "DayQuil Cold & Flu Relief",
      description: "Multi-symptom relief for cold and flu. Non-drowsy daytime formula.",
      category: "Cold & Flu",
      price: "18.99",
      stock: 120,
      minStock: 30,
      manufacturer: "Vicks",
      expiryDate: "2026-09-30",
      requiresPrescription: false,
      batchNumber: "DAY240501"
    },
    {
      name: "NyQuil Nighttime Cold & Flu",
      description: "Nighttime multi-symptom cold and flu relief. Helps you rest.",
      category: "Cold & Flu",
      price: "18.99",
      stock: 110,
      minStock: 25,
      manufacturer: "Vicks",
      expiryDate: "2026-09-30",
      requiresPrescription: false,
      batchNumber: "NYQ240501"
    },
    {
      name: "Robitussin DM Cough Syrup",
      description: "Controls cough and thins mucus. Sugar-free formula available.",
      category: "Cold & Flu",
      price: "14.99",
      stock: 90,
      minStock: 20,
      manufacturer: "Robitussin",
      expiryDate: "2026-08-31",
      requiresPrescription: false,
      batchNumber: "ROB240601"
    },
    {
      name: "Throat Lozenges Honey Lemon",
      description: "Soothing throat lozenges with honey and lemon. Pack of 20.",
      category: "Cold & Flu",
      price: "6.99",
      stock: 200,
      minStock: 40,
      manufacturer: "Halls",
      expiryDate: "2027-03-31",
      requiresPrescription: false,
      batchNumber: "THR240701"
    },
    // Allergy & Sinus
    {
      name: "Claritin 24-Hour Allergy Relief",
      description: "Non-drowsy 24-hour allergy relief. Loratadine 10mg tablets.",
      category: "Allergy",
      price: "22.99",
      stock: 150,
      minStock: 30,
      manufacturer: "Claritin",
      expiryDate: "2026-12-31",
      requiresPrescription: false,
      batchNumber: "CLA240801"
    },
    {
      name: "Zyrtec Allergy Tablets",
      description: "Fast-acting allergy relief. Cetirizine HCl 10mg.",
      category: "Allergy",
      price: "24.99",
      stock: 140,
      minStock: 28,
      manufacturer: "Zyrtec",
      expiryDate: "2027-01-31",
      requiresPrescription: false,
      batchNumber: "ZYR240901"
    },
    {
      name: "Benadryl Allergy Ultratabs",
      description: "Fast relief from allergy symptoms. Diphenhydramine HCl 25mg.",
      category: "Allergy",
      price: "16.99",
      stock: 180,
      minStock: 35,
      manufacturer: "Benadryl",
      expiryDate: "2026-11-30",
      requiresPrescription: false,
      batchNumber: "BEN241001"
    },
    {
      name: "Flonase Nasal Spray",
      description: "24-hour allergy relief nasal spray. Fluticasone propionate.",
      category: "Allergy",
      price: "28.99",
      stock: 85,
      minStock: 20,
      manufacturer: "Flonase",
      expiryDate: "2026-10-31",
      requiresPrescription: false,
      batchNumber: "FLO241101"
    },
    // Digestive Health
    {
      name: "Pepto-Bismol Liquid",
      description: "Relief from upset stomach, nausea, heartburn, and diarrhea.",
      category: "Digestive Health",
      price: "12.99",
      stock: 100,
      minStock: 25,
      manufacturer: "Pepto-Bismol",
      expiryDate: "2026-09-30",
      requiresPrescription: false,
      batchNumber: "PEP241201"
    },
    {
      name: "Tums Extra Strength Antacid",
      description: "Fast relief from heartburn and acid indigestion. Calcium carbonate 750mg.",
      category: "Digestive Health",
      price: "8.99",
      stock: 220,
      minStock: 45,
      manufacturer: "Tums",
      expiryDate: "2027-02-28",
      requiresPrescription: false,
      batchNumber: "TUM241301"
    },
    {
      name: "Imodium A-D Anti-Diarrheal",
      description: "Controls symptoms of diarrhea. Loperamide HCl 2mg.",
      category: "Digestive Health",
      price: "14.99",
      stock: 75,
      minStock: 20,
      manufacturer: "Imodium",
      expiryDate: "2026-12-31",
      requiresPrescription: false,
      batchNumber: "IMO241401"
    },
    {
      name: "Metamucil Fiber Supplement",
      description: "Daily fiber supplement for digestive health. Psyllium husk powder.",
      category: "Digestive Health",
      price: "19.99",
      stock: 60,
      minStock: 15,
      manufacturer: "Metamucil",
      expiryDate: "2027-01-31",
      requiresPrescription: false,
      batchNumber: "MET241501"
    },
    // Vitamins & Supplements
    {
      name: "Vitamin D3 2000 IU Softgels",
      description: "Supports bone health and immune function. 120 softgels.",
      category: "Vitamins",
      price: "16.99",
      stock: 180,
      minStock: 40,
      manufacturer: "Nature Made",
      expiryDate: "2027-06-30",
      requiresPrescription: false,
      batchNumber: "VD3241601"
    },
    {
      name: "Multivitamin for Adults",
      description: "Complete daily nutrition with essential vitamins and minerals.",
      category: "Vitamins",
      price: "24.99",
      stock: 150,
      minStock: 35,
      manufacturer: "Centrum",
      expiryDate: "2027-05-31",
      requiresPrescription: false,
      batchNumber: "MUL241701"
    },
    {
      name: "Vitamin C 1000mg Tablets",
      description: "Immune support with high-potency Vitamin C. 100 tablets.",
      category: "Vitamins",
      price: "12.99",
      stock: 200,
      minStock: 50,
      manufacturer: "Emergen-C",
      expiryDate: "2027-04-30",
      requiresPrescription: false,
      batchNumber: "VC1241801"
    },
    {
      name: "Omega-3 Fish Oil Capsules",
      description: "Heart and brain health support. EPA and DHA omega-3 fatty acids.",
      category: "Vitamins",
      price: "29.99",
      stock: 120,
      minStock: 30,
      manufacturer: "Nordic Naturals",
      expiryDate: "2026-12-31",
      requiresPrescription: false,
      batchNumber: "OM3241901"
    },
    {
      name: "Calcium + Vitamin D Tablets",
      description: "Bone health support with calcium carbonate and vitamin D3.",
      category: "Vitamins",
      price: "18.99",
      stock: 140,
      minStock: 35,
      manufacturer: "Caltrate",
      expiryDate: "2027-03-31",
      requiresPrescription: false,
      batchNumber: "CAL242001"
    },
    // Prescription Medications
    {
      name: "Lisinopril 10mg Tablets",
      description: "ACE inhibitor for high blood pressure and heart failure.",
      category: "Cardiovascular",
      price: "45.99",
      stock: 80,
      minStock: 20,
      manufacturer: "Zestril",
      expiryDate: "2026-11-30",
      requiresPrescription: true,
      batchNumber: "LIS242101"
    },
    {
      name: "Metformin 500mg Tablets",
      description: "Type 2 diabetes medication. Helps control blood sugar levels.",
      category: "Diabetes",
      price: "32.99",
      stock: 100,
      minStock: 25,
      manufacturer: "Glucophage",
      expiryDate: "2026-10-31",
      requiresPrescription: true,
      batchNumber: "MET242201"
    },
    {
      name: "Atorvastatin 20mg Tablets",
      description: "Cholesterol-lowering medication. Helps prevent heart disease.",
      category: "Cardiovascular",
      price: "55.99",
      stock: 90,
      minStock: 22,
      manufacturer: "Lipitor",
      expiryDate: "2026-12-31",
      requiresPrescription: true,
      batchNumber: "ATO242301"
    },
    {
      name: "Amlodipine 5mg Tablets",
      description: "Calcium channel blocker for high blood pressure.",
      category: "Cardiovascular",
      price: "38.99",
      stock: 85,
      minStock: 20,
      manufacturer: "Norvasc",
      expiryDate: "2027-01-31",
      requiresPrescription: true,
      batchNumber: "AML242401"
    },
    // Diabetes Care
    {
      name: "Blood Glucose Test Strips",
      description: "Accurate blood glucose monitoring. Pack of 50 strips.",
      category: "Diabetes",
      price: "42.99",
      stock: 60,
      minStock: 15,
      manufacturer: "OneTouch",
      expiryDate: "2026-08-31",
      requiresPrescription: false,
      batchNumber: "BGT242501"
    },
    {
      name: "Insulin Pen Needles 32G",
      description: "Ultra-fine insulin pen needles. Pack of 100.",
      category: "Diabetes",
      price: "25.99",
      stock: 80,
      minStock: 20,
      manufacturer: "BD",
      expiryDate: "2028-12-31",
      requiresPrescription: false,
      batchNumber: "IPN242601"
    },
    {
      name: "Lancets for Blood Testing",
      description: "Sterile lancets for blood glucose testing. Pack of 100.",
      category: "Diabetes",
      price: "15.99",
      stock: 120,
      minStock: 30,
      manufacturer: "Accu-Chek",
      expiryDate: "2028-06-30",
      requiresPrescription: false,
      batchNumber: "LAN242701"
    },
    // First Aid & Wound Care
    {
      name: "Adhesive Bandages Assorted",
      description: "Sterile adhesive bandages in assorted sizes. Box of 100.",
      category: "First Aid",
      price: "8.99",
      stock: 200,
      minStock: 50,
      manufacturer: "Band-Aid",
      expiryDate: "2029-12-31",
      requiresPrescription: false,
      batchNumber: "BAN242801"
    },
    {
      name: "Antibiotic Ointment",
      description: "Triple antibiotic ointment for wound care. Prevents infection.",
      category: "First Aid",
      price: "7.99",
      stock: 150,
      minStock: 35,
      manufacturer: "Neosporin",
      expiryDate: "2026-09-30",
      requiresPrescription: false,
      batchNumber: "ANT242901"
    },
    {
      name: "Hydrogen Peroxide 3%",
      description: "Antiseptic solution for cleaning wounds. 16 fl oz bottle.",
      category: "First Aid",
      price: "4.99",
      stock: 180,
      minStock: 40,
      manufacturer: "CVS Health",
      expiryDate: "2027-12-31",
      requiresPrescription: false,
      batchNumber: "HYD243001"
    },
    {
      name: "Elastic Bandage Wrap",
      description: "Compression bandage for sprains and strains. 3-inch width.",
      category: "First Aid",
      price: "12.99",
      stock: 100,
      minStock: 25,
      manufacturer: "ACE",
      expiryDate: "2029-06-30",
      requiresPrescription: false,
      batchNumber: "ELA243101"
    },
    // Women's Health
    {
      name: "Prenatal Vitamins",
      description: "Complete nutrition for pregnant and nursing mothers.",
      category: "Women's Health",
      price: "32.99",
      stock: 75,
      minStock: 20,
      manufacturer: "Nature Made",
      expiryDate: "2027-03-31",
      requiresPrescription: false,
      batchNumber: "PRE243201"
    },
    {
      name: "Folic Acid 400mcg Tablets",
      description: "Essential B vitamin for pregnancy and general health.",
      category: "Women's Health",
      price: "14.99",
      stock: 90,
      minStock: 25,
      manufacturer: "Nature's Bounty",
      expiryDate: "2027-02-28",
      requiresPrescription: false,
      batchNumber: "FOL243301"
    },
    {
      name: "Iron Supplement 65mg",
      description: "Iron sulfate for iron deficiency anemia prevention.",
      category: "Women's Health",
      price: "16.99",
      stock: 80,
      minStock: 20,
      manufacturer: "Feosol",
      expiryDate: "2027-01-31",
      requiresPrescription: false,
      batchNumber: "IRO243401"
    },
    // Men's Health
    {
      name: "Men's Daily Multivitamin",
      description: "Specially formulated multivitamin for men's nutritional needs.",
      category: "Men's Health",
      price: "26.99",
      stock: 85,
      minStock: 22,
      manufacturer: "One A Day",
      expiryDate: "2027-04-30",
      requiresPrescription: false,
      batchNumber: "MEN243501"
    },
    {
      name: "Saw Palmetto Extract",
      description: "Natural supplement for prostate health support.",
      category: "Men's Health",
      price: "24.99",
      stock: 60,
      minStock: 15,
      manufacturer: "Nature's Way",
      expiryDate: "2026-11-30",
      requiresPrescription: false,
      batchNumber: "SAW243601"
    },
    // Children's Medicine
    {
      name: "Children's Tylenol Liquid",
      description: "Pain reliever and fever reducer for children. Cherry flavor.",
      category: "Pediatric",
      price: "13.99",
      stock: 100,
      minStock: 25,
      manufacturer: "Tylenol",
      expiryDate: "2026-08-31",
      requiresPrescription: false,
      batchNumber: "CTY243701"
    },
    {
      name: "Children's Motrin Suspension",
      description: "Ibuprofen suspension for children's pain and fever.",
      category: "Pediatric",
      price: "14.99",
      stock: 95,
      minStock: 25,
      manufacturer: "Motrin",
      expiryDate: "2026-09-30",
      requiresPrescription: false,
      batchNumber: "CMO243801"
    },
    {
      name: "Children's Multivitamin Gummies",
      description: "Fun gummy vitamins with essential nutrients for kids.",
      category: "Pediatric",
      price: "18.99",
      stock: 120,
      minStock: 30,
      manufacturer: "Flintstones",
      expiryDate: "2027-05-31",
      requiresPrescription: false,
      batchNumber: "CGU243901"
    },
    // Skin Care
    {
      name: "Hydrocortisone Cream 1%",
      description: "Anti-itch and anti-inflammatory cream for skin irritation.",
      category: "Dermatology",
      price: "9.99",
      stock: 130,
      minStock: 30,
      manufacturer: "Cortizone-10",
      expiryDate: "2026-12-31",
      requiresPrescription: false,
      batchNumber: "HYC244001"
    },
    {
      name: "Calamine Lotion",
      description: "Soothing lotion for poison ivy, insect bites, and skin irritation.",
      category: "Dermatology",
      price: "6.99",
      stock: 110,
      minStock: 25,
      manufacturer: "Caladryl",
      expiryDate: "2027-06-30",
      requiresPrescription: false,
      batchNumber: "CAL244101"
    },
    {
      name: "Sunscreen SPF 30",
      description: "Broad spectrum sun protection. Water resistant formula.",
      category: "Dermatology",
      price: "16.99",
      stock: 150,
      minStock: 35,
      manufacturer: "Coppertone",
      expiryDate: "2027-07-31",
      requiresPrescription: false,
      batchNumber: "SUN244201"
    },
    // Eye Care
    {
      name: "Artificial Tears Eye Drops",
      description: "Lubricating eye drops for dry eyes. Preservative-free.",
      category: "Eye Care",
      price: "12.99",
      stock: 90,
      minStock: 22,
      manufacturer: "Systane",
      expiryDate: "2026-10-31",
      requiresPrescription: false,
      batchNumber: "ART244301"
    },
    {
      name: "Allergy Eye Drops",
      description: "Antihistamine eye drops for itchy, watery eyes.",
      category: "Eye Care",
      price: "18.99",
      stock: 75,
      minStock: 18,
      manufacturer: "Zaditor",
      expiryDate: "2026-11-30",
      requiresPrescription: false,
      batchNumber: "ALL244401"
    },
    // Oral Care
    {
      name: "Fluoride Toothpaste",
      description: "Cavity protection toothpaste with fluoride. Mint flavor.",
      category: "Oral Care",
      price: "4.99",
      stock: 200,
      minStock: 50,
      manufacturer: "Crest",
      expiryDate: "2027-12-31",
      requiresPrescription: false,
      batchNumber: "FLU244501"
    },
    {
      name: "Antibacterial Mouthwash",
      description: "Kills germs and freshens breath. Alcohol-free formula.",
      category: "Oral Care",
      price: "8.99",
      stock: 150,
      minStock: 35,
      manufacturer: "Listerine",
      expiryDate: "2027-08-31",
      requiresPrescription: false,
      batchNumber: "ANM244601"
    },
    {
      name: "Dental Floss",
      description: "Waxed dental floss for effective plaque removal.",
      category: "Oral Care",
      price: "3.99",
      stock: 180,
      minStock: 45,
      manufacturer: "Oral-B",
      expiryDate: "2029-12-31",
      requiresPrescription: false,
      batchNumber: "DEN244701"
    }
  ];

  try {
    console.log('🌱 Starting to seed products...');
    
    // Add IDs to products and insert in batches
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < sampleProducts.length; i += batchSize) {
      const batch = sampleProducts.slice(i, i + batchSize);
      
      const productsToInsert = batch.map(product => ({
        id: generateId(),
        ...product
      }));
      
      await db.insert(products).values(productsToInsert);
      insertedCount += productsToInsert.length;
      
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${productsToInsert.length} products`);
    }
    
    console.log(`🎉 Successfully seeded ${insertedCount} products to the database!`);
    
    // Create a summary of categories
    const categorySummary = sampleProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Product Categories Summary:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    return {
      success: true,
      message: `Successfully seeded ${insertedCount} products`,
      categorySummary,
      totalProducts: insertedCount
    };
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Export for use in other modules
export { addManyProducts as default };
