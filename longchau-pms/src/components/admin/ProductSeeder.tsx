import React, { useState } from 'react';
import { db } from '../../lib/db';
import { products } from '../../lib/schema';

const ProductSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState<string>('');
  const [seedingResults, setSeedingResults] = useState<any>(null);

  // Simple ID generator
  const generateId = (): string => {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

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
    }
  ];

  const seedProducts = async () => {
    try {
      setIsSeeding(true);
      setSeedingStatus('Starting product seeding...');
      
      // Insert products in batches
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
        
        setSeedingStatus(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${productsToInsert.length} products`);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Create category summary
      const categorySummary = sampleProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setSeedingResults({
        success: true,
        totalProducts: insertedCount,
        categorySummary
      });
      
      setSeedingStatus(`Successfully seeded ${insertedCount} products!`);
      
    } catch (error) {
      console.error('Error seeding products:', error);
      setSeedingStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Database Seeder</h2>
        <p className="text-gray-600 mb-6">
          Add a comprehensive set of pharmaceutical products to your database. This will add {sampleProducts.length} products 
          across multiple categories including pain relief, vitamins, prescription medications, and more.
        </p>
        
        {!seedingResults && (
          <button
            onClick={seedProducts}
            disabled={isSeeding}
            className={`px-6 py-3 rounded-lg font-medium ${
              isSeeding
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSeeding ? 'Seeding Products...' : `Seed ${sampleProducts.length} Products`}
          </button>
        )}
        
        {seedingStatus && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{seedingStatus}</p>
          </div>
        )}
        
        {seedingResults && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Seeding Completed!</h3>
              <p className="text-green-700">Successfully added {seedingResults.totalProducts} products to the database.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Categories Added:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(seedingResults.categorySummary).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => {
                setSeedingResults(null);
                setSeedingStatus('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Seed More Products
            </button>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• This will add sample products with realistic pharmaceutical data</li>
            <li>• Products include both prescription and over-the-counter medications</li>
            <li>• Stock levels and expiry dates are set with realistic values</li>
            <li>• Each product gets a unique ID and batch number</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductSeeder;
