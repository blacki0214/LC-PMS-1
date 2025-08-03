const { addManyProducts } = require('./dist/scripts/addProducts.js');

async function runSeeding() {
  try {
    console.log('🚀 Starting product seeding process...');
    const result = await addManyProducts();
    console.log('\n✅ Seeding completed successfully!');
    console.log(`📈 Total products added: ${result.totalProducts}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeding();
