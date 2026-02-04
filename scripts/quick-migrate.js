/**
 * Quick Data Migration: Transform existing products to variant schema
 * This will create the new collections in MongoDB Compass
 */

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

console.log('🚀 Starting Quick Migration to Variant Schema\n');

async function migrate() {
    try {
        // Connect
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Step 1: Create Categories from existing products
        console.log('📂 Step 1: Creating Categories...');
        const productsCollection = db.collection('products');
        const categoriesCollection = db.collection('categories');

        const uniqueCategories = await productsCollection.distinct('category');
        console.log(`   Found ${uniqueCategories.length} unique categories`);

        const categoryMap = new Map();

        for (const catName of uniqueCategories) {
            if (!catName) continue;

            const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const category = {
                name: catName,
                slug,
                description: `${catName} collection`,
                parentId: null,
                order: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await categoriesCollection.updateOne(
                { slug },
                { $set: category },
                { upsert: true }
            );

            const doc = await categoriesCollection.findOne({ slug });
            categoryMap.set(catName, doc._id);
            console.log(`   ✓ Created: ${catName}`);
        }

        console.log(`✅ Created ${categoryMap.size} categories\n`);

        // Step 2: Transform Products to Variant Schema
        console.log('🛍️  Step 2: Converting Products to Variant Schema...');

        const oldProducts = await productsCollection.find({}).toArray();
        console.log(`   Found ${oldProducts.length} products to convert`);

        let converted = 0;
        const productsWithVariants = db.collection('products_variants');

        for (const product of oldProducts) {
            try {
                const sizes = product.sizes || ['One Size'];
                const variants = [];

                // Create a variant for each size
                for (const size of sizes) {
                    const sku = `${product.slug}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, '');

                    variants.push({
                        _id: new mongoose.Types.ObjectId(),
                        sku,
                        attributes: { Size: size },
                        price: {
                            amount: product.price || 0,
                            currency: 'INR',
                            originalAmount: product.originalPrice || null
                        },
                        inventory: {
                            quantity: Math.floor((product.stock || 0) / sizes.length),
                            lowStockThreshold: 5,
                            reserved: 0
                        },
                        images: (product.images || []).map((url, idx) => ({
                            url,
                            isPrimary: idx === 0,
                            alt: `${product.name} - ${size}`
                        })),
                        isActive: product.isActive !== false
                    });
                }

                const categoryId = categoryMap.get(product.category);

                const newProduct = {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description || '',
                    brand: product.brand || '5AZ',
                    categories: categoryId ? [categoryId] : [],
                    attributes: [{ name: 'Size', values: sizes }],
                    variants,
                    metaTitle: product.name,
                    metaDescription: product.description?.substring(0, 160),
                    tags: [product.category, product.team, product.league].filter(Boolean),
                    team: product.team,
                    league: product.league,
                    season: product.season,
                    isActive: product.isActive !== false,
                    createdAt: product.createdAt || new Date(),
                    updatedAt: new Date()
                };

                await productsWithVariants.insertOne(newProduct);
                converted++;

                if (converted % 20 === 0) {
                    console.log(`   Progress: ${converted}/${oldProducts.length}`);
                }
            } catch (error) {
                console.error(`   ⚠️  Failed: ${product.name} - ${error.message}`);
            }
        }

        console.log(`✅ Converted ${converted} products\n`);

        // Step 3: Create sample cart
        console.log('🛒 Step 3: Creating sample cart structure...');
        const cartsCollection = db.collection('carts');

        const sampleCart = {
            userId: null,
            sessionId: 'sample-session-123',
            items: [],
            lastActivity: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await cartsCollection.insertOne(sampleCart);
        console.log('✅ Created carts collection\n');

        // Step 4: Backup and swap
        console.log('🔄 Step 4: Swapping collections...');

        const timestamp = Date.now();

        try {
            await productsCollection.rename(`products_backup_${timestamp}`);
            console.log('   ✓ Backed up old products');
        } catch (e) {
            console.log('   ⚠️  Could not backup (might not exist)');
        }

        await productsWithVariants.rename('products');
        console.log('   ✓ Activated new products collection');

        console.log(`✅ Migration completed!\n`);

        // Summary
        console.log('📊 Summary:');
        console.log(`   Categories: ${categoryMap.size}`);
        console.log(`   Products: ${converted} converted to variant schema`);
        console.log(`   Backup: products_backup_${timestamp}`);
        console.log('');
        console.log('🎉 Check MongoDB Compass now - you should see:');
        console.log('   - categories (NEW)');
        console.log('   - products (with variants)');
        console.log('   - carts (NEW)');
        console.log('   - products_backup_' + timestamp);
        console.log('');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate();
