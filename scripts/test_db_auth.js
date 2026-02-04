const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const uri = process.env.MONGODB_URI + "&authSource=admin";
    console.log('Testing connection with authSource=admin');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('SUCCESS: Connected to MongoDB.');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB.');
        console.error('Error Details:', err.message);
        process.exit(1);
    }
}

test();
