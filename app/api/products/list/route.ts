import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { advancedRateLimit, rateLimitResponse, getClientIP } from '@/lib/rate-limit';

// Maximum results per query to prevent data exfiltration
const MAX_RESULTS = 100;

export async function GET(request: Request) {
    try {
        const ip = getClientIP(request);

        // Rate limiting: 30 requests per minute for product queries
        const rateLimitResult = advancedRateLimit(ip, 'products-list', 30, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.retryAfter);
        }

        const { searchParams } = new URL(request.url);
        const rawCategory = searchParams.get('category');
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');

        // Sanitize and validate pagination
        const limit = Math.min(parseInt(limitParam || '50'), MAX_RESULTS);
        const page = Math.max(parseInt(pageParam || '1'), 1);
        const skip = (page - 1) * limit;

        await dbConnect();

        // Build query safely
        const query: any = { isActive: true };
        if (rawCategory && /^[a-zA-Z0-9\s\-\/_]+$/.test(rawCategory)) {
            // Check both the string field and look for name in related categories
            query.$or = [
                { category: new RegExp(rawCategory, 'i') },
                { name: new RegExp(rawCategory, 'i') } // Fallback for search-like behavior
            ];
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .select('-__v') // Exclude version key
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .lean(),
            Product.countDocuments(query)
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Product list error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
