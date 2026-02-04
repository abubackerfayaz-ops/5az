const { MongoClient } = require('mongodb');
const dns = require('dns').promises;
const path = require('path');
const fs = require('fs');

// Try to load env
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        console.log('✅ Loaded environment from .env.local');
    } else {
        console.error('❌ .env.local not found at:', envPath);
    }
} catch (e) {
    console.error('❌ Error loading dotenv:', e.message);
}

async function diagnose() {
    const uri = process.env.MONGODB_URI;

    console.log('\n--- 🔍 MongoDB Atlas Diagnostic Tool ---');

    if (!uri) {
        console.error('❌ MONGODB_URI is not defined in your environment.');
        return;
    }

    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('Testing URI:', maskedUri);

    // 1. Connectivity Check
    try {
        const cluster = uri.split('@')[1].split('/')[0].split('?')[0];
        console.log(`\n1. Checking connectivity to cluster: ${cluster}...`);

        try {
            const srv = await dns.resolveSrv(`_mongodb._tcp.${cluster}`);
            console.log(`   ✅ DNS SRV records found (${srv.length} nodes). Network is reachable.`);
        } catch (dnsErr) {
            console.error(`   ❌ DNS resolution failed. This usually means a network block or typo in the cluster name.`);
            console.error(`      Error: ${dnsErr.message}`);
        }
    } catch (e) {
        console.error('   ❌ Could not parse cluster from URI.');
    }

    // 2. Authentication Check
    console.log('\n2. Attempting to authenticate...');
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });

    try {
        await client.connect();
        console.log('   ✅ SUCCESS! Connected and authenticated successfully.');

        const dbs = await client.db().admin().listDatabases();
        console.log('   Available databases:', dbs.databases.map(db => db.name).join(', '));

        const currentDb = client.db().databaseName;
        console.log(`   Connected to target database: "${currentDb}"`);

    } catch (err) {
        console.error('   ❌ FAILED TO CONNECT');

        if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
            console.log('\n🛑 DIAGNOSIS: INCORRECT CREDENTIALS');
            console.log('--------------------------------------------------');
            console.log('The MongoDB server rejected your username or password.');
            console.log('ACTION REQUIRED:');
            console.log('1. Go to MongoDB Atlas -> Database Access');
            console.log('2. Find user: ' + (uri.match(/\/\/([^:]+):/)?.[1] || 'unknown'));
            console.log('3. Click "Edit" -> "Edit Password"');
            console.log('4. Set a NEW password (try something simple like "Pass12345" for now)');
            console.log('5. Update .env.local with the new password');
            console.log('6. Ensure there are no special characters like @, :, / in the password');
            console.log('   (If there are, you must URL encode them. e.g. @ -> %40)');
            console.log('--------------------------------------------------');
        } else if (err.message.includes('ETIMEOUT') || err.message.includes('selection timeout')) {
            console.log('\n🛑 DIAGNOSIS: NETWORK TIMEOUT / IP BLOCK');
            console.log('--------------------------------------------------');
            console.log('The server did not respond in time.');
            console.log('ACTION REQUIRED:');
            console.log('1. Go to MongoDB Atlas -> Network Access');
            console.log('2. Click "+ ADD IP ADDRESS"');
            console.log('3. Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
            console.log('4. Click "Confirm" and wait 1 minute for it to apply.');
            console.log('--------------------------------------------------');
        } else {
            console.error('   Error Details:', err.message);
        }
    } finally {
        await client.close();
    }
}

diagnose();
