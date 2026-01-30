const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

async function checkMiscellaneous() {
    await mongoose.connect(process.env.MONGODB_URI);

    const queries = [
        { name: "Cases/Covers", query: { $or: [{ name: /case/i }, { name: /cover/i }, { description: /case/i }] } },
        { name: "Graphic Tees", query: { $or: [{ name: /tee/i }, { name: /t-shirt/i }, { description: /graphic/i }] } },
        { name: "Accessories", query: { $or: [{ name: /mug/i }, { name: /keychain/i }, { name: /poster/i }] } },
        { name: "Footwear", query: { $or: [{ name: /shoe/i }, { name: /boot/i }, { name: /slipper/i }] } }
    ];

    console.log("Checking for miscellaneous items...");
    for (const q of queries) {
        const count = await mongoose.connection.db.collection('products').countDocuments(q.query);
        const samples = await mongoose.connection.db.collection('products').find(q.query).limit(3).toArray();
        console.log(`\n${q.name}: ${count}`);
        samples.forEach(s => console.log(` - ${s.name}`));
    }

    process.exit(0);
}

checkMiscellaneous();
