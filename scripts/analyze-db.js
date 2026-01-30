const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

async function checkCounts() {
    await mongoose.connect(process.env.MONGODB_URI);

    const categories = await mongoose.connection.db.collection('products').aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    const leagues = await mongoose.connection.db.collection('products').aggregate([
        { $group: { _id: "$league", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    console.log("Categories in DB:");
    console.log(categories);
    console.log("\nLeagues in DB:");
    console.log(leagues);

    process.exit(0);
}

checkCounts();
