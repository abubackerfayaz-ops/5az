/**
 * Migration Script: Transform Old Schema → New Variant-First Schema
 * 
 * This script:
 * 1. Migrates products to variant-based structure
 * 2. Creates categories from existing product categories
 * 3. Updates orders to new snapshot format
 * 4. Preserves all existing data
 * 
 * IMPORTANT: Run this after backing up your database!
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to database
async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

/**
 * Step 1: Create Category documents from product categories
 */
async function migrateCategories() {
    console.log('\n📂 Step 1: Migrating Categories...');

    const OldProduct = mongoose.connection.collection('products');
    const Category = mongoose.connection.collection('categories');

    // Get unique categories from products
    const categories = await OldProduct.distinct('category');
    console.log(`   Found ${categories.length} unique categories`);

    const categoryMap = new Map();

    for (const categoryName of categories) {
        if (!categoryName) continue;

        const slug = categoryName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const category = {
            name: categoryName,
            slug,
            description: `${categoryName} collection`,
            parentId: null,
            order: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await Category.updateOne(
            { slug },
            { $set: category },
            { upsert: true }
        );

        // Get ObjectId for mapping
        const doc = await Category.findOne({ slug });
        categoryMap.set(categoryName, doc._id);

        console.log(`   ✓ ${categoryName} → ${slug}`);
    }

    console.log(`✅ Migrated ${categoryMap.size} categories`);
    return categoryMap;
}

/**
 * Step 2: Transform Products to Variant-First Structure
 */
async function migrateProducts(categoryMap) {
    console.log('\n🛍️  Step 2: Migrating Products to Variant Model...');

    const OldProduct = mongoose.connection.collection('products');
    const NewProduct = mongoose.connection.collection('products_new');

    const products = await OldProduct.find({}).toArray();
    console.log(`   Found ${products.length} products to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const oldProduct of products) {
        try {
            // Generate variants from sizes
            const variants = [];
            const sizes = oldProduct.sizes || ['One Size'];
            const basePrice = oldProduct.price || 0;

            for (const size of sizes) {
                const sku = oldProduct.sku
                    ? `${oldProduct.sku}-${size.replace(/\s+/g, '')}`.toUpperCase()
                    : `SKU-${oldProduct._id.toString().slice(-8)}-${size}`.toUpperCase();

                const variant = {
                    _id: new mongoose.Types.ObjectId(),
                    sku,
                    attributes: { Size: size },
                    price: {
                        amount: basePrice,
                        currency: 'INR',
                        originalAmount: oldProduct.originalPrice || null
                    },
                    inventory: {
                        quantity: Math.floor((oldProduct.stock || 0) / sizes.length),
                        lowStockThreshold: 5,
                        reserved: 0
                    },
                    images: oldProduct.images?.map((url, idx) => ({
                        url,
                        isPrimary: idx === 0,
                        alt: `${oldProduct.name} - ${size}`
                    })) || [],
                    isActive: oldProduct.isActive !== false
                };

                variants.push(variant);
            }

            // Create new product document
            const categoryId = categoryMap.get(oldProduct.category);

            const newProduct = {
                _id: oldProduct._id,
                name: oldProduct.name,
                slug: oldProduct.slug,
                description: oldProduct.description || '',
                brand: oldProduct.brand || '5AZ',
                categories: categoryId ? [categoryId] : [],

                // Define attributes
                attributes: [
                    {
                        name: 'Size',
                        values: sizes
                    }
                ],

                // Embedded variants
                variants,

                // SEO
                metaTitle: oldProduct.name,
                metaDescription: oldProduct.description?.substring(0, 160),
                tags: [oldProduct.category, oldProduct.team, oldProduct.league].filter(Boolean),

                // Jersey-specific
                team: oldProduct.team,
                league: oldProduct.league,
                season: oldProduct.season,

                isActive: oldProduct.isActive !== false,
                createdAt: oldProduct.createdAt || new Date(),
                updatedAt: new Date()
            };

            await NewProduct.insertOne(newProduct);
            migrated++;

            if (migrated % 50 === 0) {
                console.log(`   Progress: ${migrated}/${products.length}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to migrate product ${oldProduct.name}:`, error.message);
            skipped++;
        }
    }

    console.log(`✅ Migrated ${migrated} products (${skipped} skipped)`);
    return { migrated, skipped };
}

/**
 * Step 3: Migrate Orders to Snapshot Format
 */
async function migrateOrders() {
    console.log('\n📦 Step 3: Migrating Orders...');

    const OldOrder = mongoose.connection.collection('orders');
    const NewOrder = mongoose.connection.collection('orders_new');
    const Product = mongoose.connection.collection('products_new');

    const orders = await OldOrder.find({}).toArray();
    console.log(`   Found ${orders.length} orders to migrate`);

    let migrated = 0;

    for (const oldOrder of orders) {
        try {
            // Transform items to new format
            const items = [];

            for (const oldItem of oldOrder.items || []) {
                // Find product and first variant
                const product = await Product.findOne({ _id: oldItem.product });

                if (!product || !product.variants || product.variants.length === 0) {
                    console.warn(`   ⚠️  Product not found for order item, using snapshot data`);
                }

                const variant = product?.variants?.[0];

                items.push({
                    productId: oldItem.product,
                    variantId: variant?._id || new mongoose.Types.ObjectId(),
                    name: oldItem.name,
                    sku: variant?.sku || 'UNKNOWN',
                    price: oldItem.price,
                    attributes: variant?.attributes || {},
                    image: oldItem.image,
                    quantity: oldItem.quantity,
                    subtotal: oldItem.price * oldItem.quantity
                });
            }

            const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = subtotal * 0.18; // 18% GST
            const shipping = subtotal > 1000 ? 0 : 99;
            const grandTotal = subtotal + tax + shipping;

            const newOrder = {
                _id: oldOrder._id,
                userId: oldOrder.user,
                customerDetails: {
                    name: oldOrder.customerDetails?.name || 'Customer',
                    email: oldOrder.customerDetails?.email || 'unknown@email.com',
                    phone: oldOrder.customerDetails?.phone
                },

                items,

                totals: {
                    subtotal,
                    tax,
                    taxRate: 0.18,
                    shipping,
                    discount: 0,
                    grandTotal
                },

                payment: {
                    provider: 'razorpay',
                    method: oldOrder.paymentMethod || 'card',
                    transactionId: oldOrder.transactionRef,
                    gatewayOrderId: oldOrder.transactionRef,
                    status: oldOrder.paymentStatus === 'success' ? 'paid' : 'pending',
                    paidAt: oldOrder.paymentStatus === 'success' ? oldOrder.createdAt : null
                },

                shipping: {
                    address: oldOrder.customerDetails?.address || {
                        name: 'Customer',
                        line1: 'Unknown',
                        city: 'Unknown',
                        state: 'Unknown',
                        postalCode: '000000',
                        country: 'India'
                    },
                    trackingNumber: oldOrder.trackingNumber,
                    method: 'standard',
                    shippedAt: oldOrder.status === 'shipped' ? oldOrder.updatedAt : null,
                    deliveredAt: oldOrder.status === 'delivered' ? oldOrder.updatedAt : null
                },

                status: oldOrder.status || 'pending',

                createdAt: oldOrder.createdAt || new Date(),
                updatedAt: oldOrder.updatedAt || new Date()
            };

            await NewOrder.insertOne(newOrder);
            migrated++;
        } catch (error) {
            console.error(`   ❌ Failed to migrate order:`, error.message);
        }
    }

    console.log(`✅ Migrated ${migrated} orders`);
}

/**
 * Step 4: Backup old collections and replace with new
 */
async function swapCollections() {
    console.log('\n🔄 Step 4: Swapping Collections...');

    const db = mongoose.connection.db;

    // Backup old collections
    const timestamp = Date.now();

    try {
        await db.collection('products').rename(`products_backup_${timestamp}`);
        console.log('   ✓ Backed up products');
    } catch (e) {
        console.log('   ⚠️  No old products collection to backup');
    }

    try {
        await db.collection('orders').rename(`orders_backup_${timestamp}`);
        console.log('   ✓ Backed up orders');
    } catch (e) {
        console.log('   ⚠️  No old orders collection to backup');
    }

    // Rename new collections
    await db.collection('products_new').rename('products');
    console.log('   ✓ Activated new products collection');

    await db.collection('orders_new').rename('orders');
    console.log('   ✓ Activated new orders collection');

    console.log(`✅ Collections swapped (backups: *_backup_${timestamp})`);
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('🚀 Starting Database Migration to Variant-First Schema\n');
    console.log('⚠️  IMPORTANT: Ensure you have a database backup before proceeding!');
    console.log('');

    await connect();

    try {
        // Step 1: Categories
        const categoryMap = await migrateCategories();

        // Step 2: Products
        const productStats = await migrateProducts(categoryMap);

        // Step 3: Orders
        await migrateOrders();

        // Step 4: Swap collections
        await swapCollections();

        console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n');
        console.log('Summary:');
        console.log(`   Categories: ${categoryMap.size}`);
        console.log(`   Products: ${productStats.migrated} migrated, ${productStats.skipped} skipped`);
        console.log('');
        console.log('Next steps:');
        console.log('   1. Test your application thoroughly');
        console.log('   2. If issues occur, restore from backup collections');
        console.log('   3. Delete backup collections after confirming everything works');
        console.log('');

    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error);
        console.error('\nDatabase state may be inconsistent. Restore from backup if needed.');
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run migration
migrate();
