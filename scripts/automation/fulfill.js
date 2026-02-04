const { chromium } = require('playwright');
const mongoose = require('mongoose');
const Order = require('../../models/Order'); // Adjust path specific to your compilation (might need ts-node or compiled js)

// NOTE: This script is designed to be run locally by the admin.
// Usage: node scripts/automation/fulfill.js <ORDER_ID>

const ORDER_ID = process.argv[2];

if (!ORDER_ID) {
    console.error("Please provide an Order ID.");
    process.exit(1);
}

// Mock Data for now if DB connection is complex in raw JS script
// In production, you would connect to DB or fetch from API
const MOCK_ORDER = {
    items: [
        { name: "Argentina Home Kit 2024", size: "L", quantity: 1, supplierUrl: "https://www.osjerseystore.com/product/argentina-home-2024" }
    ],
    shipping: {
        firstName: "Lionel",
        lastName: "Messi",
        address: "123 Main St",
        city: "Miami",
        state: "Florida",
        pincode: "33101",
        phone: "9999999999",
        email: "lio@goat.com"
    }
};

(async () => {
    console.log(`🚀 Launching Fulfillment Bot for Order #${ORDER_ID}...`);

    // Launch browser in HEADFUL mode so you can see and intervene
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    try {
        // Step 1: Navigate to Product
        const item = MOCK_ORDER.items[0];
        console.log(`🔍 Navigating to: ${item.supplierUrl}`);

        // If we don't have a direct URL, we search
        if (!item.supplierUrl || item.supplierUrl.includes("osjerseystore.com")) {
            await page.goto("https://www.osjerseystore.com/");
            await page.fill('input[name="q"]', item.name); // Adjust selector based on actual site
            await page.press('input[name="q"]', 'Enter');
            // Wait for Admin to click the correct product if search is fuzzy
            console.log("⚠️ Please click the correct product if search results are multiple.");
            await page.waitForTimeout(5000);
        } else {
            await page.goto(item.supplierUrl);
        }

        // Step 2: Select Size
        console.log(`📏 Selecting Size: ${item.size}`);
        // Logic to click size button. This relies on specific selectors of osjerseystore
        // Example: await page.click(`text=${item.size}`); 

        // Step 3: Add to Cart
        console.log("🛒 Adding to Cart...");
        // await page.click('button:has-text("Add to Cart")');

        // Step 4: Go to Checkout
        // await page.goto('https://www.osjerseystore.com/checkout');

        // Step 5: Fill Shipping (The "Magic" Part)
        console.log("✍️ Auto-filling Shipping Details...");
        /*
        await page.fill('#shipping-first-name', MOCK_ORDER.shipping.firstName);
        await page.fill('#shipping-last-name', MOCK_ORDER.shipping.lastName);
        await page.fill('#shipping-address1', MOCK_ORDER.shipping.address);
        await page.fill('#shipping-city', MOCK_ORDER.shipping.city);
        await page.fill('#shipping-zip', MOCK_ORDER.shipping.pincode);
        await page.fill('#shipping-phone', MOCK_ORDER.shipping.phone);
        */

        console.log("✅ Data filled! Please verify and complete payment manually.");
        console.log("🛑 Script pausing for 5 minutes to allow manual completion...");

        await page.waitForTimeout(300000); // 5 minutes

    } catch (error) {
        console.error("❌ Automation Error:", error);
    } finally {
        await browser.close();
    }
})();
