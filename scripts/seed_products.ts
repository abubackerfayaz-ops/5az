import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

const DATA_FILE = path.join(__dirname, '..', 'scraped_products.json');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        if (!fs.existsSync(DATA_FILE)) {
            console.error(`Data file not found at ${DATA_FILE}. Run the scraper first.`);
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        console.log(`Found ${data.length} products to seed.`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of data) {
            const { slug, ...otherData } = item;

            // Check if product exists
            const existingProduct = await Product.findOne({ slug });

            if (existingProduct) {
                // Update
                await Product.updateOne({ slug }, { $set: otherData });
                updatedCount++;
            } else {
                // Create
                await Product.create({ slug, ...otherData });
                createdCount++;
            }
        }

        console.log(`Seeding complete. Created: ${createdCount}, Updated: ${updatedCount}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
