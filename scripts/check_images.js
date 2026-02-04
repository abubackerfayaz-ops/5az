const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    variants: [{
        images: [{ url: String }]
    }]
}));

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({}).lean();
    console.log(`Total products: ${products.length}`);
    products.forEach(p => {
        const imageCount = p.variants?.[0]?.images?.length || 0;
        console.log(`Product: ${p.name}, Images: ${imageCount}`);
        if (imageCount > 0) {
            console.log(`  First Image: ${p.variants[0].images[0].url}`);
        }
    });
    process.exit(0);
}

check();
