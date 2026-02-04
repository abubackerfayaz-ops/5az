/**
 * Check and Populate Orders & Reviews Collections
 * Creates sample data if collections are empty
 */

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function checkAndPopulate() {
    try {
        console.log('🔍 Checking Orders & Reviews Collections\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Check if collections exist
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('📚 Current Collections:');
        collectionNames.forEach(name => console.log(`   - ${name}`));
        console.log('');

        // Check Orders
        console.log('📦 Orders Collection:');
        console.log('====================');

        if (!collectionNames.includes('orders')) {
            console.log('   ⚠️  Orders collection does not exist');
            console.log('   Creating empty orders collection...');
            await db.createCollection('orders');
            console.log('   ✓ Created orders collection');
        }

        const ordersCount = await db.collection('orders').countDocuments();
        console.log(`   Total orders: ${ordersCount}`);

        if (ordersCount === 0) {
            console.log('   Creating sample orders...\n');

            // Get a sample user and product
            const user = await db.collection('users').findOne({});
            const product = await db.collection('products').findOne({ variants: { $exists: true, $ne: [] } });

            if (user && product && product.variants && product.variants.length > 0) {
                const variant = product.variants[0];

                const sampleOrders = [
                    {
                        userId: user._id,
                        status: 'delivered',
                        items: [
                            {
                                productId: product._id,
                                variantId: variant._id,
                                name: product.name,
                                sku: variant.sku,
                                price: variant.price.amount,
                                quantity: 1
                            }
                        ],
                        totals: {
                            subtotal: variant.price.amount,
                            tax: Math.round(variant.price.amount * 0.18),
                            shipping: 99,
                            grandTotal: variant.price.amount + Math.round(variant.price.amount * 0.18) + 99
                        },
                        payment: {
                            provider: 'razorpay',
                            transactionId: 'pay_sample_' + Date.now(),
                            status: 'paid'
                        },
                        shipping: {
                            address: {
                                name: user.name?.first + ' ' + user.name?.last || 'Customer',
                                line1: '123 Main Street',
                                city: 'Mumbai',
                                state: 'Maharashtra',
                                postalCode: '400001',
                                country: 'India'
                            },
                            carrier: 'Delhivery',
                            trackingNumber: 'DHL' + Date.now()
                        },
                        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
                    },
                    {
                        userId: user._id,
                        status: 'paid',
                        items: [
                            {
                                productId: product._id,
                                variantId: variant._id,
                                name: product.name,
                                sku: variant.sku,
                                price: variant.price.amount,
                                quantity: 2
                            }
                        ],
                        totals: {
                            subtotal: variant.price.amount * 2,
                            tax: Math.round(variant.price.amount * 2 * 0.18),
                            shipping: 99,
                            grandTotal: (variant.price.amount * 2) + Math.round(variant.price.amount * 2 * 0.18) + 99
                        },
                        payment: {
                            provider: 'razorpay',
                            transactionId: 'pay_sample_' + (Date.now() + 1),
                            status: 'paid'
                        },
                        shipping: {
                            address: {
                                name: user.name?.first + ' ' + user.name?.last || 'Customer',
                                line1: '456 Park Avenue',
                                city: 'Delhi',
                                state: 'Delhi',
                                postalCode: '110001',
                                country: 'India'
                            },
                            carrier: 'BlueDart',
                            trackingNumber: 'BD' + Date.now()
                        },
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
                    }
                ];

                await db.collection('orders').insertMany(sampleOrders);
                console.log(`   ✓ Created ${sampleOrders.length} sample orders`);
            } else {
                console.log('   ⚠️  Need user and product with variants to create sample orders');
            }
        } else {
            console.log('   ✓ Orders collection already has data');

            // Show sample order
            const sampleOrder = await db.collection('orders').findOne({});
            if (sampleOrder) {
                console.log('\n   Sample Order:');
                console.log(`   - Order ID: ${sampleOrder._id}`);
                console.log(`   - Status: ${sampleOrder.status}`);
                console.log(`   - Items: ${sampleOrder.items?.length || 0}`);
                console.log(`   - Total: ₹${sampleOrder.totals?.grandTotal || 0}`);
            }
        }

        console.log('');

        // Check Reviews
        console.log('⭐ Reviews Collection:');
        console.log('=====================');

        if (!collectionNames.includes('reviews')) {
            console.log('   ⚠️  Reviews collection does not exist');
            console.log('   Creating empty reviews collection...');
            await db.createCollection('reviews');
            console.log('   ✓ Created reviews collection');
        }

        const reviewsCount = await db.collection('reviews').countDocuments();
        console.log(`   Total reviews: ${reviewsCount}`);

        if (reviewsCount === 0) {
            console.log('   Creating sample reviews...\n');

            // Get sample user and products
            const user = await db.collection('users').findOne({});
            const products = await db.collection('products').find({}).limit(5).toArray();

            if (user && products.length > 0) {
                const sampleReviews = products.map((product, idx) => ({
                    productId: product._id,
                    userId: user._id,
                    rating: 4 + (idx % 2), // 4 or 5 stars
                    comment: [
                        'Great quality jersey! Fits perfectly and the material is top-notch.',
                        'Absolutely love it! Fast delivery and authentic product.',
                        'Perfect jersey for the season. Highly recommended!',
                        'Amazing quality and great price. Will buy again!',
                        'Excellent product! Exceeded my expectations.'
                    ][idx],
                    createdAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000)
                }));

                await db.collection('reviews').insertMany(sampleReviews);
                console.log(`   ✓ Created ${sampleReviews.length} sample reviews`);
            } else {
                console.log('   ⚠️  Need user and products to create sample reviews');
            }
        } else {
            console.log('   ✓ Reviews collection already has data');

            // Show sample review
            const sampleReview = await db.collection('reviews').findOne({});
            if (sampleReview) {
                console.log('\n   Sample Review:');
                console.log(`   - Rating: ${sampleReview.rating}/5 ⭐`);
                console.log(`   - Comment: "${sampleReview.comment?.substring(0, 50)}..."`);
            }
        }

        console.log('\n');

        // Final Summary
        console.log('✅ COLLECTIONS STATUS');
        console.log('====================');

        const finalCounts = {
            users: await db.collection('users').countDocuments(),
            categories: await db.collection('categories').countDocuments(),
            products: await db.collection('products').countDocuments(),
            carts: await db.collection('carts').countDocuments(),
            orders: await db.collection('orders').countDocuments(),
            reviews: await db.collection('reviews').countDocuments()
        };

        Object.entries(finalCounts).forEach(([name, count]) => {
            const status = count > 0 ? '✓' : '⚠️';
            console.log(`   ${status} ${name.padEnd(15)} ${count.toLocaleString()} documents`);
        });

        console.log('\n🎉 All collections ready!');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkAndPopulate();
