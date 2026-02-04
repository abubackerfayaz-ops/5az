import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
    try {
        const { params } = context;
        let product;

        try {
            await dbConnect();
            product = await Product.findById(params.id);
            if (!product) {
                // Try finding by slug if ID fails (sometimes useful during transitions)
                product = await Product.findOne({ slug: params.id });
            }
        } catch (dbError) {
            console.warn('Database unavailable, falling back to JSON for single product:', dbError);
            const filePath = path.join(process.cwd(), 'scraped_os.json');
            if (fs.existsSync(filePath)) {
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // Search by slug first, then by name (approx) or ID
                product = jsonData.find((p: any) => p.slug === params.id);
            }
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error('API product detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

