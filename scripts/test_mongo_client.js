const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log('Testing with MongoClient...');
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('SUCCESS: Connected with MongoClient.');
        const databases = await client.db().admin().listDatabases();
        console.log('Databases:', databases.databases.map(db => db.name));
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

test();
