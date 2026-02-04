const { MongoClient } = require('mongodb');

const password = 'JIF80BSryuX2o2dc';
const cluster = 'cluster0.jmdh0hc.mongodb.net';

const usernames = [
    'abubackerfayaz_db_user',
    'abubackerfayaz_user',
    'abubackerfayaz',
    'fayaz',
    'admin'
];

async function test() {
    for (const user of usernames) {
        const uri = `mongodb+srv://${user}:${password}@${cluster}/?retryWrites=true&w=majority`;
        console.log(`Testing user: ${user}`);
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
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
    console.log('No username worked with this password.');
}

test();
