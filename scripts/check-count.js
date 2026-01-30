const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const { Schema } = mongoose;
const ProductSchema = new Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    const count = await Product.countDocuments();
    console.log(`Current Product Count: ${count}`);
    process.exit(0);
}

run();
