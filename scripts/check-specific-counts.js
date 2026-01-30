const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

async function checkCounts() {
    await mongoose.connect(process.env.MONGODB_URI);

    const potential = [
        { name: "Drops", query: { category: /Season 25-26/i } },
        { name: "Retro", query: { category: /Retro/i } },
        { name: "International", query: { $or: [{ category: /International/i }, { league: /International/i }] } },
        { name: "Premier League", query: { league: /Premier League/i } },
        { name: "La Liga", query: { league: /La Liga/i } },
        { name: "Serie A", query: { league: /Serie A/i } },
        { name: "Bundesliga", query: { league: /Bundesliga/i } },
        { name: "Training", query: { name: /Training/i } },
        { name: "Special Edition", query: { name: /Special Edition/i } }
    ];

    for (const p of potential) {
        const count = await mongoose.connection.db.collection('products').countDocuments(p.query);
        console.log(`${p.name}: ${count}`);
    }

    process.exit(0);
}

checkCounts();
