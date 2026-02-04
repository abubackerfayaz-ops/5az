const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Define Schema (Simplified for syncing)
const ProductSchema = new mongoose.Schema({
    name: String,
    supplierUrl: String,
    isActive: Boolean,
    variants: [{
        price: { amount: Number },
        vendorPrice: Number
    }]
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function sync() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find({ supplierUrl: { $exists: true } });
    console.log(`Found ${products.length} products to sync.`);

    let updatedCount = 0;

    for (const product of products) {
        try {
            console.log(`Checking ${product.name}...`);
            const { data } = await axios.get(product.supplierUrl, { headers: HEADERS, timeout: 10000 });
            const $ = cheerio.load(data);
            const warmupData = $('#wix-warmup-data').html();

            if (!warmupData) {
                console.log(`No warmup data for ${product.name}`);
                continue;
            }

            const json = JSON.parse(warmupData);

            // Search for product price in Wix warmup data
            // Usually under apps.shoppingCart.product.price
            let newVendorPrice = null;
            let inStock = false;

            const findInObj = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.price !== undefined && obj.id && (obj.name === product.name || product.supplierUrl.includes(obj.urlPart))) {
                    // Wix often has 'price' (original) and 'discountedPrice' or 'comparePrice'
                    // In our previous analysis, comparePrice was the selling price
                    newVendorPrice = obj.comparePrice || obj.discountedPrice || obj.price;
                    inStock = obj.isInStock;
                    return;
                }
                for (const key in obj) {
                    if (newVendorPrice) break;
                    findInObj(obj[key]);
                }
            };

            findInObj(json);

            if (newVendorPrice !== null) {
                const markupPrice = newVendorPrice + 100;
                let changed = false;

                if (product.isActive !== inStock) {
                    product.isActive = inStock;
                    changed = true;
                }

                product.variants.forEach(v => {
                    if (v.vendorPrice !== newVendorPrice || v.price.amount !== markupPrice) {
                        v.vendorPrice = newVendorPrice;
                        v.price.amount = markupPrice;
                        changed = true;
                    }
                });

                if (changed) {
                    await product.save();
                    console.log(`Updated ${product.name}: Price ${markupPrice}, Stock: ${inStock}`);
                    updatedCount++;
                } else {
                    console.log(`${product.name} is up to date.`);
                }
            } else {
                console.log(`Could not find price in warmup data for ${product.name}`);
            }

            // Sleep to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (e) {
            console.error(`Error syncing ${product.name}:`, e.message);
        }
    }

    console.log(`Sync complete. Updated ${updatedCount} products.`);
    process.exit(0);
}

sync();
