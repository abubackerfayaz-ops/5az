const axios = require('axios');
const cheerio = require('cheerio');
const slugify = require('slugify');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

// DB Schema
const { Schema } = mongoose;
const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: { type: [String], required: true },
        category: { type: String, required: true },
        team: { type: String },
        league: { type: String },
        sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
        inStock: { type: Boolean, default: true },
        slug: { type: String, unique: true, required: true },
    },
    { timestamps: true }
);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Constants
const BASE_URL = 'https://footballmonk.in/shop/';
const MAX_PAGES = 200; // Increased limit for full site
const BATCH_SIZE = 5; // Insert every 5 products

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    }
}

async function scrapePageAndProcess(pageNumber) {
    const url = pageNumber === 1 ? BASE_URL : `${BASE_URL}page/${pageNumber}/`;
    console.log(`\n--- Scraping Page ${pageNumber}: ${url} ---`);

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);

        // Find product links on this page
        const links = new Set();
        $('a[href*="/product/"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/product/') && !href.includes('add-to-cart')) {
                links.add(href);
            }
        });

        const pageLinks = Array.from(links);
        if (pageLinks.length === 0) return false; // Stop if no products

        console.log(`Found ${pageLinks.length} products. Processing...`);

        // Process each product immediately
        for (const prodUrl of pageLinks) {
            await processProduct(prodUrl);
            await new Promise(r => setTimeout(r, 200)); // fast delay
        }

        return true; // Continue to next page

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('Page not found. End of catalog.');
            return false;
        }
        console.error(`Error on page ${pageNumber}: ${error.message}`);
        return false;
    }
}

async function processProduct(url) {
    try {
        // User requested not to remove/prevent duplicates for this run
        /*
        const existing = await Product.findOne({ slug: { $regex: url.split('/product/')[1].replace('/', '') } });
        if (existing) {
            console.log(`Skipping existing: ${url}`);
            return;
        }
        */

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);

        const name = $('h1.product_title').text().trim() || $('h1').first().text().trim();

        // Try to get a better description
        let description = $('.woocommerce-product-details__short-description').text().trim() ||
            $('#tab-description').text().trim() ||
            $('.woocommerce-Tabs-panel--description').text().trim();

        if (!description || description.length < 10) {
            description = `Premium quality ${name}. Official design, high-quality fabric, and authentic branding. Perfect for fans and players alike.`;
        }

        let priceText = $('.price ins .amount').first().text().trim() || $('.price .amount').last().text().trim();
        if (!priceText) priceText = $('.price').first().text().trim();

        let originalPriceText = $('.price del .amount').first().text().trim();

        const cleanPrice = (str) => {
            if (!str) return null;
            const match = str.replace(/,/g, '').match(/[\d.]+/);
            return match ? parseFloat(match[0]) : null;
        };

        const price = cleanPrice(priceText);
        const originalPrice = cleanPrice(originalPriceText) || (price ? Math.round(price * 1.2) : null);

        let images = [];
        $('.woocommerce-product-gallery__image').each((i, el) => {
            const fullSize = $(el).find('img').attr('data-large_image') || $(el).find('img').attr('src') || $(el).attr('data-thumb');
            if (fullSize) images.push(fullSize);
        });

        if (images.length === 0) {
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) images.push(ogImage);
        }

        images = [...new Set(images)];

        let category = 'Jerseys';
        let team = 'Unknown Team';
        let league = 'Unknown League';

        const categories = [];
        $('.posted_in a').each((i, el) => categories.push($(el).text()));

        if (categories.length > 0) {
            category = categories[0];
            if (categories.includes('Premier League')) league = 'Premier League';
            else if (categories.includes('La Liga')) league = 'La Liga';
            else if (categories.includes('Serie A')) league = 'Serie A';
            else if (categories.includes('Bundesliga')) league = 'Bundesliga';
            else if (categories.includes('International')) {
                league = 'International';
                category = 'National Teams';
            }
        }

        if (name && price) {
            const product = new Product({
                name,
                description,
                price,
                originalPrice,
                images: images.length > 0 ? images : ['https://placehold.co/600x800/1a1a1a/ffffff?text=No+Image'],
                category: category,
                team: name.split(' ')[0],
                league,
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                inStock: true,
                slug: slugify(name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(7)
            });
            await product.save();
            console.log(`Saved: ${name}`);
        }
    } catch (e) {
        // Silent fail to keep moving
    }
}

async function run() {
    await connectDB();
    // We do NOT clear DB anymore, we append/upsert

    for (let i = 1; i <= MAX_PAGES; i++) {
        const shouldContinue = await scrapePageAndProcess(i);
        if (!shouldContinue) break;
    }

    console.log('Scraping completed.');
    process.exit(0);
}

run();
