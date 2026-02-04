const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = mongoose.connection.collection('products');
    const products = await Product.find({}).limit(5).toArray();
    const fs = require('fs');
    fs.writeFileSync('products_sample.json', JSON.stringify(products, null, 2));
    console.log('Sample saved to products_sample.json');
    process.exit(0);
}

run();
