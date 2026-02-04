require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;
console.log('URI:', uri);
console.log('Length:', uri.length);
for (let i = 0; i < uri.length; i++) {
    console.log(i, uri[i], uri.charCodeAt(i).toString(16));
}
