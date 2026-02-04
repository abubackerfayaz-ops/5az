import { NextResponse } from 'next/server';
import { generateHomepageSchema } from '@/lib/seo';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'homepage';

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://5az-store.vercel.app';

        let schema = null;

        if (type === 'homepage') {
            schema = await generateHomepageSchema(baseUrl);
        }

        if (!schema) {
            return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
        }

        return NextResponse.json(schema);
    } catch (error) {
        console.error('SEO schema generation error:', error);
        return NextResponse.json({ error: 'Failed to generate schema' }, { status: 500 });
    }
}
