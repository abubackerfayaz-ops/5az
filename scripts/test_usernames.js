const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const password = '4lAWUTkKnSYZKcS';
const cluster = 'cluster0.jmdh0hc.mongodb.net';
const dbName = '5az-store';

const usernames = [
    'abubackerfayaz_db_user',
    'abubackerfayaz_user',
    'abubackerfayaz-ops',
    'fayaz_db_user',
    'fayaz_user',
    'abubackerfayaz',
    'fayaz',
    'admin',
    'db_user',
    'user'
];

async function testAll() {
    for (const user of usernames) {
        const uri = `mongodb+srv://${user}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
        console.log(`Testing user: ${user}`);
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
        try {
            await client.connect();
            console.log(`✅ SUCCESS with user: ${user}`);
            process.exit(0);
        } catch (err) {
            console.log(`❌ FAILED for ${user}: ${err.message}`);
        } finally {
            await client.close();
        }
    }
    console.log('No username worked.');
    process.exit(1);
}

testAll();
