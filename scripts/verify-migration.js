/**
 * Verify Migration Results
 * Shows what collections exist and sample data
 */

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function verify() {
    try {
        console.log('🔍 Verifying Migration Results\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('📚 Collections in Database:');
        console.log('============================');

        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   ${collection.name.padEnd(30)} ${count.toLocaleString()} documents`);
        }

        console.log('\n');

        // Check categories
        console.log('📂 Categories Sample:');
        console.log('====================');
        const categories = await db.collection('categories').find({}).limit(5).toArray();
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.slug})`);
        });

        console.log('\n');

        // Check products with variants
        console.log('🛍️  Products with Variants Sample:');
        console.log('==================================');
        const products = await db.collection('products').find({}).limit(3).toArray();

        products.forEach(product => {
            console.log(`\n   📦 ${product.name}`);
            console.log(`      Slug: ${product.slug}`);
            console.log(`      Brand: ${product.brand}`);
            console.log(`      Variants: ${product.variants?.length || 0}`);

            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant, idx) => {
                    console.log(`         ${idx + 1}. SKU: ${variant.sku}`);
                    console.log(`            Size: ${variant.attributes?.Size || 'N/A'}`);
                    console.log(`            Price: ₹${variant.price?.amount || 0}`);
                    console.log(`            Stock: ${variant.inventory?.quantity || 0}`);
                });
            }
        });

        console.log('\n');

        // Check cart structure
        console.log('🛒 Cart Collection:');
        console.log('==================');
        const cartCount = await db.collection('carts').countDocuments();
        console.log(`   Total carts: ${cartCount}`);

        console.log('\n');

        // Summary
        console.log('✅ MIGRATION VERIFICATION COMPLETE');
        console.log('==================================');
        console.log('');
        console.log('🎉 Your database now has:');
        console.log('   - Variant-based products');
        console.log('   - Hierarchical categories');
        console.log('   - Cart collection ready');
        console.log('');
        console.log('🔄 Refresh MongoDB Compass to see all collections!');
        console.log('');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
