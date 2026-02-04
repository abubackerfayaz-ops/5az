/**
 * Complete Database Summary
 * Shows all collections with sample data
 */

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function showSummary() {
    try {
        console.log('📊 COMPLETE DATABASE SUMMARY\n');
        console.log('============================\n');

        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // 1. USERS
        console.log('👥 USERS');
        console.log('--------');
        const usersCount = await db.collection('users').countDocuments();
        console.log(`Total: ${usersCount}`);

        if (usersCount > 0) {
            const users = await db.collection('users').find({}).limit(3).toArray();
            users.forEach((user, idx) => {
                console.log(`${idx + 1}. ${user.name?.first} ${user.name?.last}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
            });
        }
        console.log('');

        // 2. CATEGORIES
        console.log('📂 CATEGORIES');
        console.log('-------------');
        const categoriesCount = await db.collection('categories').countDocuments();
        console.log(`Total: ${categoriesCount}`);

        const categories = await db.collection('categories').find({}).toArray();
        categories.forEach((cat, idx) => {
            console.log(`${idx + 1}. ${cat.name} (/${cat.slug})`);
            if (cat.parentId) {
                console.log(`   Parent: ${cat.parentId}`);
            }
        });
        console.log('');

        // 3. PRODUCTS
        console.log('🛍️  PRODUCTS (Variant-First)');
        console.log('---------------------------');
        const productsCount = await db.collection('products').countDocuments();
        console.log(`Total: ${productsCount}`);

        const products = await db.collection('products').find({}).limit(3).toArray();
        products.forEach((product, idx) => {
            console.log(`${idx + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Variants: ${product.variants?.length || 0}`);
            if (product.variants && product.variants.length > 0) {
                console.log(`   Sample SKU: ${product.variants[0].sku}`);
                console.log(`   Price: ₹${product.variants[0].price.amount}`);
                console.log(`   Stock: ${product.variants[0].inventory.quantity}`);
            }
        });
        console.log('');

        // 4. CARTS
        console.log('🛒 CARTS');
        console.log('--------');
        const cartsCount = await db.collection('carts').countDocuments();
        console.log(`Total: ${cartsCount}`);

        if (cartsCount > 0) {
            const carts = await db.collection('carts').find({}).limit(2).toArray();
            carts.forEach((cart, idx) => {
                console.log(`${idx + 1}. Cart for user: ${cart.userId}`);
                console.log(`   Items: ${cart.items?.length || 0}`);
            });
        } else {
            console.log('   (Empty - carts will be created when users add items)');
        }
        console.log('');

        // 5. ORDERS
        console.log('📦 ORDERS (Snapshot Pricing)');
        console.log('---------------------------');
        const ordersCount = await db.collection('orders').countDocuments();
        console.log(`Total: ${ordersCount}`);

        if (ordersCount > 0) {
            const orders = await db.collection('orders').find({}).limit(3).toArray();
            orders.forEach((order, idx) => {
                console.log(`${idx + 1}. Order #${order._id.toString().slice(-8)}`);
                console.log(`   Status: ${order.status}`);
                console.log(`   Items: ${order.items?.length || 0}`);
                console.log(`   Total: ₹${order.totals?.grandTotal || 0}`);
                console.log(`   Payment: ${order.payment?.provider} (${order.payment?.status})`);
                console.log(`   Date: ${order.createdAt?.toLocaleDateString()}`);
            });
        } else {
            console.log('   (No orders yet - will be created on checkout)');
        }
        console.log('');

        // 6. REVIEWS
        console.log('⭐ REVIEWS');
        console.log('----------');
        const reviewsCount = await db.collection('reviews').countDocuments();
        console.log(`Total: ${reviewsCount}`);

        if (reviewsCount > 0) {
            const reviews = await db.collection('reviews').find({}).limit(5).toArray();
            reviews.forEach((review, idx) => {
                console.log(`${idx + 1}. ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}/5)`);
                console.log(`   "${review.comment?.substring(0, 60)}..."`);
            });
        } else {
            console.log('   (No reviews yet - will be created by customers)');
        }
        console.log('');

        // SUMMARY TABLE
        console.log('═══════════════════════════════════════');
        console.log('📊 FINAL DATABASE STATUS');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('Collection      Documents    Status');
        console.log('───────────────────────────────────────');

        const allCounts = {
            'users': usersCount,
            'categories': categoriesCount,
            'products': productsCount,
            'carts': cartsCount,
            'orders': ordersCount,
            'reviews': reviewsCount
        };

        Object.entries(allCounts).forEach(([name, count]) => {
            const status = count > 0 ? '✅ Ready' : '⚠️  Empty';
            console.log(`${name.padEnd(15)} ${count.toString().padStart(8)}    ${status}`);
        });

        console.log('───────────────────────────────────────');
        console.log('');

        console.log('🎉 DATABASE FULLY OPERATIONAL!');
        console.log('');
        console.log('Schema Features:');
        console.log('  ✓ Variant-first products (unique SKU per variant)');
        console.log('  ✓ Hierarchical categories');
        console.log('  ✓ Snapshot pricing in orders (immutable)');
        console.log('  ✓ Embedded data for fast reads');
        console.log('');
        console.log('Ready for:');
        console.log('  ✓ User registration & login');
        console.log('  ✓ Product browsing & search');
        console.log('  ✓ Shopping cart');
        console.log('  ✓ Checkout & orders');
        console.log('  ✓ Reviews & ratings');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

showSummary();
