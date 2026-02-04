const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');
const fs = require('fs');

const { Schema } = mongoose;

const ProductVariantSchema = new Schema({
    sku: { type: String, required: true },
    attributes: { type: Map, of: String },
    price: {
        amount: { type: Number, required: true },
        originalAmount: { type: Number },
        currency: { type: String, default: 'INR' }
    },
    inventory: { quantity: { type: Number, default: 100 } },
    images: [{ url: { type: String, required: true }, isPrimary: { type: Boolean, default: false } }]
});

const ProductSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String },
    isActive: { type: Boolean, default: true },
    supplierUrl: { type: String },
    variants: [ProductVariantSchema]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    const jsonPath = path.resolve(__dirname, '../scraped_os.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('scraped_os.json not found at ' + jsonPath);
        return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Read ${data.length} products from JSON`);

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear old products to ensure only scraped elements remain
        await Product.deleteMany({});
        console.log('Cleared old products.');

        for (const item of data) {
            // Wix images can be small if not cleaned, but my scraper cleaned them.
            // Map to variants
            const productData = {
                name: item.name,
                slug: item.slug,
                description: item.name + ". Premium quality football jersey from the 5AZ Archive. High-performance fabric with meticulous attention to detail.",
                brand: item.brand || '5AZ_HUB',
                category: item.category,
                isActive: true,
                supplierUrl: item.url,
                variants: [
                    {
                        sku: `${item.slug}-main`,
                        attributes: { "Size": "M" },
                        price: {
                            amount: item.price,
                            originalAmount: Math.round(item.price * 2.2),
                            currency: 'INR'
                        },
                        inventory: { quantity: 50 },
                        images: item.images.map((url, i) => ({ url, isPrimary: i === 0 }))
                    }
                ]
            };

            await Product.findOneAndUpdate(
                { slug: item.slug },
                productData,
                { upsert: true, new: true }
            );
            console.log(`✓ Imported: ${item.name}`);
        }

        console.log('\nSUCCESS: All products imported to database.');
        process.exit(0);
    } catch (e) {
        console.error('Import failed:', e);
        process.exit(1);
    }
}

run();
