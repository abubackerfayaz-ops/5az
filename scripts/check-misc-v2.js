const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

async function checkMiscellaneous() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check Cases
    const caseCount = await mongoose.connection.db.collection('products').countDocuments({ $or: [{ name: /case/i }, { name: /cover/i }] });
    const cases = await mongoose.connection.db.collection('products').find({ $or: [{ name: /case/i }, { name: /cover/i }] }).limit(5).toArray();

    // Check Tees/Hoodies
    const teeCount = await mongoose.connection.db.collection('products').countDocuments({ $or: [{ name: /tee/i }, { name: /t-shirt/i }, { name: /hoodie/i }] });
    const tees = await mongoose.connection.db.collection('products').find({ $or: [{ name: /tee/i }, { name: /t-shirt/i }, { name: /hoodie/i }] }).limit(5).toArray();

    console.log(`Cases: ${caseCount}`);
    cases.forEach(c => console.log(` - ${c.name}`));
    console.log(`\nTees/Hoodies: ${teeCount}`);
    tees.forEach(t => console.log(` - ${t.name}`));

    process.exit(0);
}

checkMiscellaneous();
