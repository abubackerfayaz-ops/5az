import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import fs from 'fs';
import path from 'path';

export async function POST() {
    try {
        await dbConnect();

        // 1. Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});

        // 2. Load products from scraped_products.json if available
        let rawProducts = [];
        const filePath = path.join(process.cwd(), 'scraped_products.json');

        if (fs.existsSync(filePath)) {
            rawProducts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } else {
            // Minimal fallback if file missing
            rawProducts = [
                {
                    name: "Real Madrid Home Jersey Season 25-26",
                    description: "Official Real Madrid home kit for the 2025-26 season.",
                    price: 2499,
                    originalPrice: 3999,
                    images: ["https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800"],
                    category: "Season 25-26",
                    sizes: ["S", "M", "L", "XL"]
                }
            ];
        }

        // 3. Extract and create categories
        const categoryNames = Array.from(new Set(rawProducts.map((p: any) => p.category || "General")));
        const categoriesMap = new Map();

        for (const name of categoryNames as string[]) {
            const cat = await Category.create({
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
                isActive: true
            });
            categoriesMap.set(name, cat._id);
        }

        // 4. Map and Insert Products
        const productsToInsert = rawProducts.slice(0, 100).map((p: any) => {
            const sizes = Array.isArray(p.sizes) && p.sizes[0] !== "" ? p.sizes : ["S", "M", "L", "XL", "XXL"];

            return {
                name: p.name,
                slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
                description: p.description || p.name,
                brand: p.brand || "5AZ",
                categories: [categoriesMap.get(p.category || "General")],
                isActive: true,
                attributes: [
                    { name: "Size", values: sizes }
                ],
                variants: sizes.map((size: string) => ({
                    sku: `${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}-${size}`,
                    attributes: { Size: size },
                    price: {
                        amount: p.price,
                        originalAmount: p.originalPrice,
                        currency: 'INR'
                    },
                    inventory: { quantity: 50 },
                    images: (p.images || []).map((url: string, idx: number) => ({
                        url,
                        isPrimary: idx === 0
                    }))
                }))
            };
        });

        await Product.insertMany(productsToInsert);

        return NextResponse.json({
            message: `Successfully seeded ${productsToInsert.length} products and ${categoryNames.length} categories!`,
            count: productsToInsert.length
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
