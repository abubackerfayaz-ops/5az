const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'scraped_products.json');

function processRetro() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error('Data file not found!');
        return;
    }

    let products = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    let retroCount = 0;
    let newDropsCount = 0;

    const currentYear = 2026;
    const retroCutoff = 2023; // Any kit purely from before 2023 season

    products = products.map(p => {
        let isRetro = false;
        let isNewDrop = false;
        const name = p.name.toLowerCase();

        // 1. Explicit keywords for Retro
        if (name.includes('retro') || name.includes('vintage') || name.includes('classic') || name.includes('heritage')) {
            isRetro = true;
        }

        // 2. Year analysis using regex
        // Matches "1999", "2005", "98-99", "1998-99", "2012-13"
        const yearRegex = /\b(19\d{2}|20\d{2})(-(\d{2}|\d{4}))?\b/g;
        const matches = p.name.match(yearRegex);

        if (matches) {
            for (const match of matches) {
                // Extract the first year part "1998" from "1998-99"
                const startYearStr = match.split('-')[0];
                const startYear = parseInt(startYearStr);

                // If year found is less than cutoff, mark as retro
                if (!isNaN(startYear) && startYear < retroCutoff) {
                    // Exclude future years if parsed incorrectly (e.g. 2050)
                    if (startYear > 1900) {
                        isRetro = true;
                    }
                }
            }
        }

        // 3. Identify New Drops (2025-26, 2026, 25-26)
        if (!isRetro) {
            if (name.includes('2025-26') || name.includes('25-26') || name.includes('2026') || name.includes('new season')) {
                isNewDrop = true;
            }
        }

        if (isRetro) {
            p.category = "Retro";
            retroCount++;
        } else if (isNewDrop) {
            p.category = "New Drops";
            newDropsCount++;
        }

        return p;
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2));
    console.log(`Processed ${products.length} products.`);
    console.log(`Identified and tagged ${retroCount} as 'Retro'.`);
    console.log(`Identified and tagged ${newDropsCount} as 'New Drops'.`);
}

processRetro();
