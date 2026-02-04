const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://footballmonk.in';
const SHOP_URL = 'https://footballmonk.in/shop/';
const OUTPUT_FILE = path.join(__dirname, '..', 'scraped_products.json');

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrape() {
    let page = 1;
    let allProducts = [];
    let hasNextPage = true;

    // Set of visited URLs to avoid duplicates
    const visitedUrls = new Set();

    while (hasNextPage) {
        // Construct page URL
        const url = page === 1 ? SHOP_URL : `${SHOP_URL}page/${page}/`;
        console.log(`Scraping listing page: ${url}`);

        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            const productLinks = [];

            // Selector for product links in loop. 
            // Usually WooCommerce uses li.product a.woocommerce-LoopProduct-link
            $('li.product').each((i, el) => {
                const link = $(el).find('a').first().attr('href');
                if (link && !visitedUrls.has(link)) {
                    productLinks.push(link);
                    visitedUrls.add(link);
                }
            });

            console.log(`Found ${productLinks.length} products on page ${page}`);

            if (productLinks.length === 0) {
                hasNextPage = false;
                break;
            }

            // Scrape specific product details
            for (const link of productLinks) {
                console.log(`Scraping product: ${link}`);
                const productData = await scrapeProduct(link); // We will define this
                if (productData) {
                    allProducts.push(productData);
                }
                await delay(1000); // 1 second delay between products
            }

            // Check for next page
            const nextButton = $('a.next.page-numbers');
            if (nextButton.length === 0) {
                console.log('No next page found. Stopping.');
                hasNextPage = false;
            } else {
                page++;
            }

            // Save intermediate progress
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));

        } catch (error) {
            console.error(`Error scraping page ${page}:`, error.message);
            if (error.response && error.response.status === 404) {
                hasNextPage = false;
            }
        }
    }

    console.log(`Scraping complete. Total products: ${allProducts.length}`);
}

async function scrapeProduct(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        let name = $('h1.product_title').text().trim();
        // Fix for duplicate text if title appears twice concatenated
        if (name.length > 0 && name.length % 2 === 0) {
            const half = name.substring(0, name.length / 2);
            if (name === half + half) {
                name = half;
            }
        }

        // Price: try to get plain price, or from variations
        let price = 0;
        let originalPrice = 0;

        const priceElement = $('p.price').first();
        const insAmount = priceElement.find('ins .amount').text().replace(/[^0-9.]/g, '');
        const amount = priceElement.find('.amount').first().text().replace(/[^0-9.]/g, '');

        if (insAmount) {
            price = parseFloat(insAmount);
            // If there is an ins, the first amount is usually the del/original
            const delAmount = priceElement.find('del .amount').text().replace(/[^0-9.]/g, '');
            if (delAmount) originalPrice = parseFloat(delAmount);
        } else if (amount) {
            price = parseFloat(amount);
        }

        const description = $('.woocommerce-product-details__short-description').html() || $('#tab-description').html() || '';
        const shortDescription = $('.woocommerce-product-details__short-description').text().trim();

        // Images
        const images = [];
        $('.woocommerce-product-gallery__image a').each((i, el) => {
            const imgUrl = $(el).attr('href');
            if (imgUrl) images.push(imgUrl);
        });
        // Fallback meta image
        if (images.length === 0) {
            const metaImg = $('meta[property="og:image"]').attr('content');
            if (metaImg) images.push(metaImg);
        }

        // Categories
        const categories = [];
        $('.posted_in a').each((i, el) => {
            categories.push($(el).text().trim());
        });

        const primaryCategory = categories.length > 0 ? categories[0] : 'Jerseys';

        // Sizes and Stock (from data-product_variations)
        let sizes = ['S', 'M', 'L', 'XL', 'XXL']; // Default
        let stock = 0;

        const variationsForm = $('form.variations_form');
        if (variationsForm.length > 0) {
            const variationsDataAttr = variationsForm.attr('data-product_variations');
            if (variationsDataAttr) {
                try {
                    const variations = JSON.parse(variationsDataAttr);
                    const availableSizes = new Set();
                    variations.forEach(v => {
                        if (v.is_in_stock) {
                            stock += (v.max_qty || 10); // Estimate if max_qty not set
                            // Try to find size attribute
                            // attributes: { "attribute_pa_size": "s" }
                            for (const key in v.attributes) {
                                if (key.includes('size')) {
                                    availableSizes.add(v.attributes[key].toUpperCase());
                                }
                            }

                            // Update price if needed (take the first available variant's price)
                            if (price === 0 && v.display_price) {
                                price = v.display_price;
                            }
                        }
                    });
                    if (availableSizes.size > 0) {
                        sizes = Array.from(availableSizes);
                    }
                } catch (e) {
                    console.error('Error parsing variations JSON', e);
                }
            }
        } else {
            // Simple product stock
            if ($('p.stock.in-stock').length > 0) {
                stock = 100; // Arbitrary for in-stock simple product
            }
        }

        // Slug
        const slug = url.split('/product/')[1].replace('/', '');

        // Team and League inference (basic)
        let team = '';
        let league = '';
        const lowerName = name.toLowerCase();

        // Simple keywords for teams
        if (lowerName.includes('madrid')) team = 'Real Madrid';
        else if (lowerName.includes('barcelona') || lowerName.includes('barca')) team = 'Barcelona';
        else if (lowerName.includes('manchester united') || lowerName.includes('man utd')) team = 'Manchester United';
        else if (lowerName.includes('manchester city')) team = 'Manchester City';
        else if (lowerName.includes('liverpool')) team = 'Liverpool';
        else if (lowerName.includes('arsenal')) team = 'Arsenal';
        else if (lowerName.includes('chelsea')) team = 'Chelsea';
        else if (lowerName.includes('bayern')) team = 'Bayern Munich';
        else if (lowerName.includes('india')) team = 'India';

        return {
            name,
            description: shortDescription || description, // Use short desc for cleaner text, or full valid HTML
            price,
            originalPrice,
            images,
            category: primaryCategory,
            team,
            sizes,
            stock: stock > 0 ? stock : 50, // Default to 50 if in stock but count unknown
            isActive: true, // assume active if scraped
            slug
        };

    } catch (error) {
        console.error(`Error scraping product ${url}:`, error.message);
        return null;
    }
}

scrape();
