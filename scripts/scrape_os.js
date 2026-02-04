const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrape() {
    const sitemapUrl = 'https://www.osjerseystore.com/store-products-sitemap.xml';
    console.log(`Fetching sitemap: ${sitemapUrl}`);

    try {
        const { data: xml } = await axios.get(sitemapUrl);

        // Split by <url> to associate images with their loc
        const urlBlocks = xml.split('<url>');
        const sitemapData = [];

        for (const block of urlBlocks) {
            const locMatch = block.match(/<loc>(https:\/\/www\.osjerseystore\.com\/product-page\/[^<]+)<\/loc>/);
            if (!locMatch) continue;

            const url = locMatch[1];
            const images = [];
            const imageMatches = block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g);
            for (const imgMatch of imageMatches) {
                const imgUrl = imgMatch[1];
                if (!imgUrl.includes('01c3aff52f2a4dffa526d7a9843d46ea') && !imgUrl.includes('e8681c_74108aeba50d4c939927749a0d94e7c6')) {
                    images.push(imgUrl.split('/v1/')[0]);
                }
            }

            sitemapData.push({ url, sitemapImages: images });
        }

        console.log(`Found ${sitemapData.length} products in sitemap.`);

        const scrapedProducts = [];

        for (let i = 0; i < sitemapData.length; i++) {
            const item = sitemapData[i];
            console.log(`[${i + 1}/${sitemapData.length}] Scraping: ${item.url}`);

            try {
                const { data: html } = await axios.get(item.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                const $ = cheerio.load(html);

                // Extract name
                let name = $('h1').first().text().trim();
                if (!name) name = item.url.split('/').pop().replace(/-/g, ' ');

                // Extract Price
                let price = 0;
                const priceMatch = html.match(/\"price\":([0-9.]+)/);
                if (priceMatch) price = parseFloat(priceMatch[1]);

                if (!price || price === 0) {
                    const fallbackPrice = html.match(/₹([0-9,]+)/);
                    if (fallbackPrice) price = parseFloat(fallbackPrice[1].replace(/,/g, ''));
                }

                if (!price || price === 0) price = 870; // Common price

                // Combine images from sitemap and HTML
                const htmlImages = [];
                $('img').each((i, el) => {
                    const src = $(el).attr('src') || $(el).attr('data-src');
                    if (src && src.includes('static.wixstatic.com/media') && !src.includes('pixel') && !src.includes('vector')) {
                        if (!src.includes('01c3aff52f2a4dffa526d7a9843d46ea') && !src.includes('e8681c_74108aeba50d4c939927749a0d94e7c6')) {
                            htmlImages.push(src.split('/v1/')[0]);
                        }
                    }
                });

                const allImages = [...new Set([...item.sitemapImages, ...htmlImages])].filter(img => img.includes('https://'));

                // Meaningful Categorization
                let category = 'CLUBS';
                const lowerName = name.toLowerCase();
                const lowerUrl = item.url.toLowerCase();

                // 1. Nations
                const nations = ['portugal', 'argentina', 'spain', 'italy', 'germany', 'france', 'brazil', 'england', 'belgium', 'netherlands', 'croatia', 'switzerland', 'international', 'world cup', 'euro 2024'];
                if (nations.some(n => lowerName.includes(n))) {
                    category = 'NATIONS';
                }

                // 2. Retro
                if (lowerName.includes('retro') || lowerName.includes('vintage') || lowerName.includes('classic') || /\b(19|20[0-1][0-9])\b/.test(lowerName)) {
                    category = 'RETRO';
                }

                // 3. Specials (Collabs, Special Editions)
                const specialKeywords = ['special', 'versace', 'cactusjack', 'dragon', 'anniversary', 'oktoberfest', 'cursed', 'celebration', 'limited'];
                if (specialKeywords.some(s => lowerName.includes(s))) {
                    category = 'SPECIALS';
                }

                // 4. New Kits (Season 25/26)
                if (lowerName.includes('25-26') || lowerName.includes('2026') || lowerName.includes('25/26')) {
                    category = 'NEW_KITS';
                }

                // Default to CLUBS if it matches club patterns (most of the rest are clubs anyway)
                const clubKeywords = ['real madrid', 'barcelona', 'united', 'liverpool', 'arsenal', 'mancity', 'city', 'chelsea', 'bayern', 'napoli', 'inter', 'alnassr', 'hilal', 'atletico', 'milan', 'juventus', 'psg', 'dortmund'];
                if (category === 'CLUBS' && !clubKeywords.some(c => lowerName.includes(c)) && category !== 'RETRO' && category !== 'SPECIALS') {
                    // Stay as CLUBS or maybe 'JERSEYS' if completely unknown
                    category = 'CLUBS';
                }

                // Brand Extraction (Team Name)
                let brand = '5AZ_HUB';
                const teams = ['real madrid', 'barcelona', 'manchester united', 'liverpool', 'arsenal', 'man city', 'chelsea', 'bayern', 'napoli', 'inter miami', 'alnassr', 'al-hilal', 'atletico', 'inter milan', 'ac milan', 'juventus', 'psg', 'dortmund', 'italy', 'argentina', 'france', 'portugal', 'spain', 'germany', 'brazil', 'england'];
                for (const team of teams) {
                    if (lowerName.includes(team)) {
                        brand = team.toUpperCase().replace('-', ' ');
                        break;
                    }
                }

                scrapedProducts.push({
                    name,
                    price,
                    images: allImages.slice(0, 6),
                    category,
                    brand,
                    url: item.url,
                    slug: item.url.split('/').pop(),
                    isActive: true
                });

                // Save progress incrementally
                fs.writeFileSync('scraped_os.json', JSON.stringify(scrapedProducts, null, 2));

                // Delay
                await new Promise(r => setTimeout(r, 200));

            } catch (err) {
                console.error(`Error scraping ${item.url}: ${err.message}`);
            }
        }

        console.log(`Scraping finished. Total: ${scrapedProducts.length}`);

    } catch (error) {
        console.error(`Scraper failed: ${error.message}`);
    }
}

scrape();
