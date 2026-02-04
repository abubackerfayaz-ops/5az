const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Fix path to point to parent directory where .env.local is
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Reading env from:', envPath);
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const MONGODB_URI = envConfig.MONGODB_URI;

async function testConnection() {
    console.log('Testing MongoDB Connection...');
    console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS: Connected to MongoDB.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR: Connection failed.');
        console.error('Name:', error.name);
        console.error('Message:', error.message);

        if (error.message.includes('bad auth')) {
            console.log('\n--- DIAGNOSIS ---');
            console.log('The password or username in .env.local is incorrect.');
        } else if (error.message.includes('querySrv ETIMEOUT')) {
            console.log('\n--- DIAGNOSIS ---');
            console.log('Network timeout. This usually means your IP address is not whitelisted in MongoDB Atlas.');
        }
    }
}

testConnection();
