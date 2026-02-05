import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isIPBlocked } from '@/lib/security-monitor';

/**
 * Global security middleware
 * Runs before every request
 */
export async function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

    // Check if IP is blocked
    const blocked = await isIPBlocked(ip);
    if (blocked) {
        console.warn(`🚫 Blocked IP attempted access: ${ip}`);
        return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
        );
    }

    // Add security headers to all responses
    const response = NextResponse.next();

    // Generate nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // Security headers (HSTS removed to prevent Render proxy loops)
    const securityHeaders = {
        'X-DNS-Prefetch-Control': 'on',
        // 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', // Removed for Render compatibility
        'X-XSS-Protection': '1; mode=block',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-Request-ID': crypto.randomUUID(),
        'X-Powered-By': 'Secure-Server' // Hide Next.js
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

// Apply to all API routes except health check
export const config = {
    matcher: [
        '/api/:path*',
        '/admin/:path*'
    ],
};
