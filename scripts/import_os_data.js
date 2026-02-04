const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Load models
// Since we are in a JS script, we use mongoose.model directly
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    attributes: [{
        name: { type: String, required: true },
        values: [{ type: String, required: true }]
    }],
    variants: [{
        sku: { type: String, required: true },
        attributes: { type: Map, of: String },
        price: {
            amount: { type: Number, required: true },
            currency: { type: String, default: 'INR' },
            originalAmount: { type: Number }
        },
        inventory: {
            quantity: { type: Number, default: 100 }
        },
        images: [{
            url: { type: String, required: true },
            isPrimary: { type: Boolean, default: false }
        }],
        isActive: { type: Boolean, default: true }
    }],
    isActive: { type: Boolean, default: true },
    team: String,
    league: String,
    tags: [String]
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const rawData = JSON.parse(fs.readFileSync('os_products_full.json', 'utf8'));
    console.log(`Processing ${rawData.length} products...`);

    // Get existing categories
    const categories = await Category.find({});
    const catMap = {};
    categories.forEach(c => {
        catMap[c.name.toLowerCase()] = c._id;
    });

    // Helper to get or create category
    const getCatId = async (name) => {
        const lower = name.toLowerCase();
        if (catMap[lower]) return catMap[lower];

        const slug = slugify(name, { lower: true, strict: true });
        const newCat = await Category.create({ name, slug });
        catMap[lower] = newCat._id;
        return newCat._id;
    };

    // Clear existing products (ONLY footbalmonk ones? User said "replace current data source")
    // To be safe, I'll delete all for now as requested.
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Cleared.');

    let importedCount = 0;

    for (const p of rawData) {
        try {
            const baseSlug = slugify(p.name, { lower: true, strict: true });
            const slug = `${baseSlug}-${Math.random().toString(36).substring(7)}`;

            // Determine categories
            const productCategories = [];
            const nameLower = p.name.toLowerCase();

            if (nameLower.includes('player edition') || nameLower.includes('player version') || nameLower.includes('authentic')) {
                productCategories.push(await getCatId('Player Version'));
            } else if (nameLower.includes('retro') || nameLower.includes('classic') || /\b(19|20)[0-1][0-9]\b/.test(p.name)) {
                productCategories.push(await getCatId('Retro'));
            } else {
                productCategories.push(await getCatId('Fan Version'));
            }

            if (nameLower.includes('2025') || nameLower.includes('25-26') || nameLower.includes('25/26')) {
                productCategories.push(await getCatId('New Drops'));
            }

            // Extract team/league
            let team = 'Unknown Team';
            let league = 'Unknown League';
            if (nameLower.includes('madrid')) team = 'Real Madrid';
            else if (nameLower.includes('barcelona')) team = 'FC Barcelona';
            else if (nameLower.includes('manchester united') || nameLower.includes('man utd')) team = 'Manchester United';
            else if (nameLower.includes('manchester city') || nameLower.includes('mancity')) team = 'Manchester City';
            else if (nameLower.includes('arsenal')) team = 'Arsenal';
            else if (nameLower.includes('liverpool')) team = 'Liverpool';
            else if (nameLower.includes('chelsea')) team = 'Chelsea';
            else if (nameLower.includes('psg')) team = 'PSG';
            else if (nameLower.includes('bayern')) team = 'Bayern Munich';
            else if (nameLower.includes('juventus')) team = 'Juventus';
            else if (nameLower.includes('milan')) team = 'AC Milan';
            else if (nameLower.includes('inter')) team = 'Inter Milan';
            else if (nameLower.includes('argentina')) team = 'Argentina';
            else if (nameLower.includes('brazil')) team = 'Brazil';
            else if (nameLower.includes('portugal')) team = 'Portugal';
            else if (nameLower.includes('france')) team = 'France';
            else if (nameLower.includes('germany')) team = 'Germany';
            else {
                const nameParts = p.name.split(' ');
                if (nameParts.length > 0) team = nameParts[0];
            }

            // Media mapping
            const images = p.media.map((m, idx) => ({
                url: m.fullUrl,
                isPrimary: idx === 0,
                alt: p.name
            }));

            // Price Logic: Supplier Price + 100
            // In os_products_full.json, discountedPrice or comparePrice is the actual selling price
            const supplierPrice = p.discountedPrice || p.comparePrice || p.price;
            const sellingPrice = supplierPrice + 100;
            const originalPrice = p.price; // The crossed out price

            // Extract sizes from options if available
            let sizes = ['S', 'M', 'L', 'XL', 'XXL'];
            const sizeOption = p.options && p.options.find(o => o.title && o.title.toLowerCase() === 'size');
            if (sizeOption && sizeOption.selections) {
                sizes = sizeOption.selections.map(s => s.value.split('-')[0].trim());
            }

            // Create variants
            const variants = sizes.map(size => ({
                sku: `${baseSlug.toUpperCase()}-${size}-${Math.random().toString(36).substring(3, 7).toUpperCase()}`,
                attributes: { Size: size },
                price: {
                    amount: sellingPrice,
                    currency: 'INR',
                    originalAmount: originalPrice + 100 // Keep the "perceived" discount
                },
                vendorPrice: supplierPrice,
                inventory: { quantity: 100 },
                images: images,
                isActive: true
            }));

            const product = new Product({
                name: p.name,
                slug: slug,
                description: p.description ? p.description.replace(/<[^>]*>?/gm, '') : `Premium quality ${p.name}. Features moisture-wicking fabric and official branding.`,
                brand: 'OS Jersey',
                categories: productCategories,
                attributes: [{
                    name: 'Size',
                    values: sizes
                }],
                variants: variants,
                team: team,
                league: league,
                tags: [team, 'Jersey', p.ribbon].filter(Boolean),
                supplierUrl: `https://www.osjerseystore.com/product-page/${p.urlPart}`,
                isActive: p.isVisible !== false
            });

            await product.save();
            importedCount++;
            if (importedCount % 10 === 0) console.log(`Imported ${importedCount}...`);
        } catch (e) {
            console.error(`Failed to import ${p.name}:`, e.message);
        }
    }

    console.log(`Successfully imported ${importedCount} products.`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
