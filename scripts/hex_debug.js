const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '.env.local');
const content = fs.readFileSync(file, 'utf-8');
console.log('Hex representation of first line:');
console.log(Buffer.from(content.split('\n')[0]).toString('hex'));
