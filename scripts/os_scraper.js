const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URLS = [
    'https://www.osjerseystore.com/shop',
    'https://www.osjerseystore.com/2023-special-edition-jersey-s',
    'https://www.osjerseystore.com/new-collection',
    'https://www.osjerseystore.com/player-edition-2023',
    'https://www.osjerseystore.com/new-23-24-season'
];
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function fetchPage(page) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
    console.log(`Fetching ${url}...`);
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        return data;
    } catch (e) {
        console.error(`Error fetching page ${page}:`, e.message);
        return null;
    }
}

function extractProducts(html) {
    const $ = cheerio.load(html);
    const warmupData = $('#wix-warmup-data').html();
    if (!warmupData) return [];

    try {
        const data = JSON.parse(warmupData);
        const products = [];

        const searchProducts = (obj) => {
            if (obj && typeof obj === 'object') {
                if (obj.productsWithMetaData && obj.productsWithMetaData.list) {
                    products.push(...obj.productsWithMetaData.list);
                } else if (obj.list && Array.isArray(obj.list) && obj.list.length > 0 && obj.list[0].id && obj.list[0].name) {
                    if (obj.list[0].price !== undefined || obj.list[0].urlPart !== undefined) {
                        products.push(...obj.list);
                    }
                }
                for (const key in obj) {
                    searchProducts(obj[key]);
                }
            }
        };

        searchProducts(data);
        return products;
    } catch (e) {
        console.error('Error parsing warmup data:', e.message);
        return [];
    }
}

async function run() {
    let allProducts = [];
    let seenIds = new Set();

    for (const baseUrl of BASE_URLS) {
        console.log(`--- Scraping Category: ${baseUrl} ---`);
        let page = 1;
        let emptyPages = 0;

        while (emptyPages < 2) {
            const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
            console.log(`Fetching ${url}...`);
            const html = await fetchPageUrl(url);
            if (!html) break;

            const products = extractProducts(html);
            let newCount = 0;
            for (const p of products) {
                if (p.id && !seenIds.has(p.id)) {
                    seenIds.add(p.id);
                    allProducts.push(p);
                    newCount++;
                }
            }

            console.log(`Page ${page}: Found ${products.length} products, ${newCount} new.`);

            if (newCount === 0 && products.length === 0) {
                emptyPages++;
            } else if (newCount === 0 && page > 1) {
                // If we found products but none are new, maybe we've reached the end of this category
                emptyPages++;
            } else {
                emptyPages = 0;
            }

            page++;
            if (page > 20) break;
        }
    }

    console.log(`Total products found: ${allProducts.length}`);
    fs.writeFileSync('os_products_raw.json', JSON.stringify(allProducts, null, 2));
    console.log('Saved to os_products_raw.json');
}

async function fetchPageUrl(url) {
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        return data;
    } catch (e) {
        console.error(`Error fetching ${url}:`, e.message);
        return null;
    }
}

run();
