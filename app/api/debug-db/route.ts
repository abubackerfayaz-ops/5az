import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({ isActive: true }).lean();
        const products = await Product.find({ isActive: true }).limit(20).lean();

        // Check if products have categories
        const productsWithCats = products.filter((p: any) => p.categories && p.categories.length > 0);

        // Check if categories assigned to products actually exist
        let linkedCorrectly = 0;
        if (products[0] && products[0].categories[0]) {
            const checkCat = await Category.findById(products[0].categories[0]);
            if (checkCat) linkedCorrectly = 1;
        }

        return NextResponse.json({
            success: true,
            counts: {
                categories: categories.length,
                products: products.length,
                productsWithCategories: productsWithCats.length
            },
            linkageTest: linkedCorrectly ? "OK" : "FAILED",
            categories: categories.map((c: any) => ({ name: c.name, id: c._id.toString() })),
            firstProduct: products[0] ? {
                name: products[0].name,
                categories: products[0].categories,
                isActive: products[0].isActive
            } : null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
