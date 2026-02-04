const fs = require('fs');
const cheerio = require('cheerio');

function extractProducts(filename) {
    const html = fs.readFileSync(filename, 'utf8');
    const $ = cheerio.load(html);
    const warmupData = $('#wix-warmup-data').html();
    if (!warmupData) return [];

    try {
        const data = JSON.parse(warmupData);
        const products = [];

        // Wix warmup data structure can be complex, searching for product lists
        const searchProducts = (obj) => {
            if (obj && typeof obj === 'object') {
                if (obj.productsWithMetaData && obj.productsWithMetaData.list) {
                    products.push(...obj.productsWithMetaData.list);
                } else if (obj.list && Array.isArray(obj.list) && obj.list.length > 0 && obj.list[0].id && obj.list[0].name) {
                    // Check if it's a product list based on keys
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
        console.error(`Error parsing ${filename}:`, e.message);
        return [];
    }
}

const p1 = extractProducts('os_shop.html');
const p2 = extractProducts('os_shop_p2.html');

console.log(`Page 1: ${p1.length} products`);
console.log(`Page 2: ${p2.length} products`);

const p1Names = new Set(p1.map(p => p.name));
const p2Names = new Set(p2.map(p => p.name));

const intersection = new Set([...p1Names].filter(x => p2Names.has(x)));
console.log(`Common products: ${intersection.size}`);

const onlyP2 = [...p2Names].filter(x => !p1Names.has(x));
console.log(`New products on page 2: ${onlyP2.length}`);
if (onlyP2.length > 0) {
    console.log('Sample new products:', onlyP2.slice(0, 5));
}
