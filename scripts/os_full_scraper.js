const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const SITEMAP_FILE = 'os_products_sitemap.xml';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function run() {
    const xml = fs.readFileSync(SITEMAP_FILE, 'utf8');
    const urls = [];
    const regex = /<loc>(https:\/\/www\.osjerseystore\.com\/product-page\/[^<]+)<\/loc>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        urls.push(match[1]);
    }

    console.log(`Found ${urls.length} products in sitemap.`);

    const results = [];
    const batchSize = 5;

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}...`);

        const promises = batch.map(async (url) => {
            try {
                const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
                const $ = cheerio.load(data);
                const warmupData = $('#wix-warmup-data').html();
                if (!warmupData) return null;

                const json = JSON.parse(warmupData);
                let productData = null;

                const findProduct = (obj) => {
                    if (!obj || typeof obj !== 'object') return;
                    // Look for the product object in Wix structure
                    if (obj.id && obj.name && (obj.price !== undefined || obj.comparePrice !== undefined)) {
                        productData = obj;
                        return;
                    }
                    for (const key in obj) {
                        if (productData) break;
                        findProduct(obj[key]);
                    }
                };

                findProduct(json);
                return productData;
            } catch (e) {
                console.error(`Failed to fetch ${url}: ${e.message}`);
                return null;
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter(r => r !== null));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully scraped ${results.length} products.`);
    fs.writeFileSync('os_products_full.json', JSON.stringify(results, null, 2));
    console.log('Results saved to os_products_full.json');
}

run();
