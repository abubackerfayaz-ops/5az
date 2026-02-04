const fs = require('fs');

async function run() {
    const url = 'https://footballmonk.in/product/premium-quality-real-madrid-home-kit-2024-25/';
    const response = await fetch(url);
    const text = await response.text();
    fs.writeFileSync('temp_product.html', text);
    console.log('Saved product page to temp_product.html');
}

run();
