const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const url = 'https://www.osjerseystore.com/product-page/italy-home-2026-world-cup-jersey';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        fs.writeFileSync('test_product.html', data);
        console.log('Saved HTML to test_product.html');
    } catch (e) {
        console.error(e);
    }
}
test();
