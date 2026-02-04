/**
 * Advanced CORS configuration for API endpoints
 */

const ALLOWED_ORIGINS = [
    'https://5az-store.vercel.app',
    'https://www.5azstore.com',
    process.env.NEXT_PUBLIC_BASE_URL || '',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
].filter(Boolean);

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'];
const MAX_AGE = 86400; // 24 hours

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
        'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
        'Access-Control-Max-Age': MAX_AGE.toString(),
        'Access-Control-Allow-Credentials': 'true'
    };

    // Only allow listed origins
    if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'))) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | null): boolean {
    if (!origin) return false;

    return ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost'));
}

/**
 * Create CORS error response
 */
export function createCorsError() {
    return new Response('CORS policy violation', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
    });
}
