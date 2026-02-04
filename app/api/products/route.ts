import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { cache, CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache';
import { advancedRateLimit, rateLimitResponse, getClientIP } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';

import fs from 'fs';
import path from 'path';

const MAX_RESULTS = 100;

/**
 * GET /api/products
 * Optimized with caching for high performance
 */
export async function GET(request: Request) {
    try {
        const ip = getClientIP(request);

        // Rate limiting
        const rateLimitResult = advancedRateLimit(ip, 'products-get', 30, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.retryAfter);
        }

        const { searchParams } = new URL(request.url);
        const rawCategory = searchParams.get('category');
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');

        // Sanitize input to prevent NoSQL injection
        const category = rawCategory ? sanitizeInput(rawCategory) : null;

        // Pagination
        const limit = Math.min(parseInt(limitParam || '50'), MAX_RESULTS);
        const page = Math.max(parseInt(pageParam || '1'), 1);
        const skip = (page - 1) * limit;

        // Generate cache key
        const cacheKey = `${CacheKeys.products(category as string)}:page${page}:limit${limit}`;

        // Try cache first
        const products = await cache(
            cacheKey,
            async () => {
                try {
                    await dbConnect();

                    const query: any = { isActive: true };
                    if (category && typeof category === 'string') {
                        query.category = category;
                    }

                    const [items, total] = await Promise.all([
                        Product.find(query)
                            .select('-__v')
                            .limit(limit)
                            .skip(skip)
                            .sort({ createdAt: -1 })
                            .lean(),
                        Product.countDocuments(query)
                    ]);

                    return {
                        products: items,
                        pagination: {
                            page,
                            limit,
                            total,
                            pages: Math.ceil(total / limit)
                        }
                    };
                } catch (dbError) {
                    console.warn('Database unavailable, falling back to JSON:', dbError);
                    const filePath = path.join(process.cwd(), 'scraped_products.json');

                    if (fs.existsSync(filePath)) {
                        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        const filtered = category
                            ? jsonData.filter((p: any) => p.category === category)
                            : jsonData;

                        const paginatedProducts = filtered.slice(skip, skip + limit);

                        return {
                            products: paginatedProducts,
                            pagination: {
                                page,
                                limit,
                                total: filtered.length,
                                pages: Math.ceil(filtered.length / limit)
                            }
                        };
                    }

                    throw new Error('No data source available');
                }
            },
            CacheTTL.products
        );

        return NextResponse.json(products, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'CDN-Cache-Control': 'public, max-age=600',
                'Vercel-CDN-Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('API products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const session = await (await import('next-auth')).getServerSession((await import('@/lib/auth')).authOptions);

        if (!session || (session as any).user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rawBody = await request.json();

        // Sanitize input to prevent NoSQL injection
        const body = sanitizeInput(rawBody);

        // Validate input
        const { productSchema } = await import('@/lib/validations');
        const validatedData = productSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({
                error: 'Invalid input',
                details: validatedData.error.format()
            }, { status: 400 });
        }

        await dbConnect();
        const product = await Product.create(validatedData.data);

        // Audit Log
        const { logAudit } = await import('@/lib/audit');
        await logAudit(
            request,
            (session as any).user.id,
            'admin',
            'CREATE_PRODUCT',
            'Product',
            product._id.toString(),
            { name: product.name }
        );

        // Invalidate product cache
        await invalidateCache('products:*');

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Product creation error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 400 });
    }
}
