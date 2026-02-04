const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema inline for standalone script
const SiteConfigSchema = new Schema(
    {
        key: { type: String, required: true, unique: true, default: 'seo_main' },
        organization: {
            name: { type: String, required: true },
            url: { type: String, required: true },
            logo: { type: String, required: true },
            contactPoint: {
                telephone: String,
                contactType: String,
            },
            sameAs: [String],
        },
        website: {
            name: { type: String, required: true },
            url: { type: String, required: true },
            searchTemplate: String,
        },
    },
    { timestamps: true }
);

const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);

const MONGODB_URI = process.env.MONGODB_URI;

async function seedSiteConfig() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is missing in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const seoData = {
            key: 'seo_main',
            organization: {
                name: '5AZ Jersey Store',
                url: 'https://5az-store.vercel.app', // Update with actual production URL if known
                logo: 'https://5az-store.vercel.app/logo.png',
                contactPoint: {
                    telephone: '+91-9876543210',
                    contactType: 'customer service',
                },
                sameAs: [
                    'https://instagram.com/5azstore',
                    'https://twitter.com/5azstore',
                    'https://facebook.com/5azstore'
                ],
            },
            website: {
                name: '5AZ Jersey Store',
                url: 'https://5az-store.vercel.app',
                searchTemplate: 'https://5az-store.vercel.app/shop?search={search_term_string}',
            }
        };

        // Upsert the configuration (update if exists, insert if new)
        await SiteConfig.findOneAndUpdate(
            { key: 'seo_main' },
            seoData,
            { upsert: true, new: true }
        );

        console.log('✅ Site SEO Config stored in MongoDB successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding site config:', error);
        process.exit(1);
    }
}

seedSiteConfig();
