const { MongoClient } = require('mongodb');

const basePassword = '4lAWUTkKnSYZKcS';
const cluster = 'cluster0.jmdh0hc.mongodb.net';
const dbName = '5az-store';
const user = 'abubackerfayaz_db_user';

const variations = [
    basePassword,
    basePassword.replace('l', '1'),
    basePassword.replace('l', 'I'),
    basePassword.replace('S', '5'),
    basePassword.replace('k', 'K'),
    basePassword.toLowerCase(),
    'admin123',
    'password',
    '12345678'
];

async function testAll() {
    for (const pwd of variations) {
        const uri = `mongodb+srv://${user}:${pwd}@${cluster}/${dbName}?retryWrites=true&w=majority`;
        console.log(`Testing password: ${pwd}`);
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
        try {
            await client.connect();
            console.log(`✅ SUCCESS with password: ${pwd}`);
            process.exit(0);
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
        } finally {
            await client.close();
        }
    }
    console.log('No variation worked.');
    process.exit(1);
}

testAll();
