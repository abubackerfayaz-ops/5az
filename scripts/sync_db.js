const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

const DATA_FILE = path.join(__dirname, '..', 'scraped_products.json');

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: { type: [String], required: true },
        category: { type: String, required: true },
        team: { type: String },
        slug: { type: String, unique: true, required: true },
        stock: { type: Number, default: 10 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function sync() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        if (!fs.existsSync(DATA_FILE)) {
            console.error('Data file not found!');
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        console.log(`Found ${data.length} products to sync.`);

        let updatedCount = 0;
        let createdCount = 0;

        for (const item of data) {
            const { slug, ...otherData } = item;

            // Ensure numeric price
            if (typeof otherData.price === 'string') {
                otherData.price = parseInt(otherData.price.replace(/[^\d]/g, ''));
            }
            if (typeof otherData.originalPrice === 'string') {
                otherData.originalPrice = parseInt(otherData.originalPrice.replace(/[^\d]/g, ''));
            }

            const existingProduct = await Product.findOne({ slug });

            if (existingProduct) {
                await Product.updateOne({ slug }, { $set: otherData });
                updatedCount++;
            } else {
                await Product.create({ slug, ...otherData });
                createdCount++;
            }
        }

        console.log(`Sync complete. Created: ${createdCount}, Updated: ${updatedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

sync();
