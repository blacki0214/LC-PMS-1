#!/usr/bin/env ts-node

import { addManyProducts } from './src/scripts/addProducts';

async function runSeeding() {
  try {
    console.log('🚀 Starting product seeding process...');
    const result = await addManyProducts();
    console.log('\n✅ Seeding completed successfully!');
    console.log(`📈 Total products added: ${result.totalProducts}`);
    console.log('\n🎯 Categories added:');
    Object.entries(result.categorySummary).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} products`);
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error);
  }
}

runSeeding();
