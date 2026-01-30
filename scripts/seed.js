const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema inline to avoid import issues in standalone script
const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: { type: [String], required: true },
        category: { type: String, required: true },
        team: { type: String },
        league: { type: String },
        color: { type: String },
        sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
        inStock: { type: Boolean, default: true },
        slug: { type: String, unique: true, required: true },
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/five-az-store';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        const products = [
            {
                name: 'Real Madrid Home Mbappe 2025-26 Jersey',
                description: 'Premium quality Real Madrid Home jersey for the 2025-26 season. Features moisture-wicking fabric and official branding.',
                price: 1125,
                originalPrice: 4999,
                images: ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'],
                category: 'Season 25-26',
                team: 'Real Madrid',
                league: 'La Liga',
                color: 'White',
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                inStock: true,
                slug: 'real-madrid-home-mbappe-2025-26',
            },
            {
                name: 'France Home 2025-26 Jersey',
                description: 'Official France National Team Home Kit. Elegant design with tricolor details.',
                price: 1299,
                originalPrice: 3999,
                images: ['https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1000&auto=format&fit=crop'],
                category: 'International',
                team: 'France',
                league: 'International',
                color: 'Blue',
                sizes: ['S', 'M', 'L', 'XL'],
                inStock: true,
                slug: 'france-home-2025-26',
            },
            {
                name: 'Manchester City Home 2024-25',
                description: 'The sky blue classic. Comfortable fit for match day or casual wear.',
                price: 999,
                originalPrice: 2499,
                images: ['https://images.unsplash.com/photo-1628891890377-571b7829875a?q=80&w=1000&auto=format&fit=crop'],
                category: 'Season 24-25',
                team: 'Manchester City',
                league: 'Premier League',
                color: 'Blue',
                sizes: ['M', 'L'],
                inStock: true,
                slug: 'man-city-home-2024-25',
            },
            {
                name: 'Arsenal Away 2025-26',
                description: 'New season away kit with bold colors.',
                price: 1150,
                originalPrice: 4500,
                images: ['https://images.unsplash.com/photo-1519475685814-6a0d63503a6a?q=80&w=1000&auto=format&fit=crop'], // Placeholder aesthetic shot
                category: 'Season 25-26',
                team: 'Arsenal',
                league: 'Premier League',
                color: 'Red',
                sizes: ['S', 'M', 'L', 'XL'],
                inStock: true,
                slug: 'arsenal-away-2025-26',
            },
            {
                name: 'FC Barcelona Home 2025-26',
                description: 'Classic Blaugrana stripes. Represents the heart of Catalonia.',
                price: 1199,
                originalPrice: 4800,
                images: ['https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1000&auto=format&fit=crop'],
                category: 'Season 25-26',
                team: 'Barcelona',
                league: 'La Liga',
                color: 'Blue',
                sizes: ['S', 'M', 'L', 'XL'],
                inStock: true,
                slug: 'barcelona-home-2025-26',
            },
            {
                name: 'Liverpool Home 2025-26',
                description: 'The Reds. Iconic home jersey for the Anfield faithful.',
                price: 1099,
                originalPrice: 3500,
                images: ['https://images.unsplash.com/photo-1517466787929-bc90951d0528?q=80&w=1000&auto=format&fit=crop'],
                category: 'Season 25-26',
                team: 'Liverpool',
                league: 'Premier League',
                color: 'Red',
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                inStock: true,
                slug: 'liverpool-home-2025-26',
            }
        ];

        await Product.insertMany(products);
        console.log('Seeded products successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
