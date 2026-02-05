import crypto from 'crypto';

/**
 * Generate Content Security Policy with nonce
 */
export function generateCSPHeader(nonce: string): string {
    const policies = [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `font-src 'self' https://fonts.gstatic.com`,
        `img-src 'self' data: https: blob:`,
        `connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com`,
        `frame-src https://api.razorpay.com`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`,
        `upgrade-insecure-requests`
    ];

    return policies.join('; ');
}

/**
 * Subresource Integrity (SRI) generator
 * For external scripts/styles
 */
export function generateSRI(content: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha384'): string {
    const hash = crypto.createHash(algorithm).update(content).digest('base64');
    return `${algorithm}-${hash}`;
}

/**
 * Security headers for API responses
 */
export function getAPISecurityHeaders(): Record<string, string> {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // Removed for Render compatibility
        'Referrer-Policy': 'no-referrer',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    };
}

/**
 * HSTS Preload configuration (DISABLED for Render compatibility)
 */
export function getHSTSHeader(): string {
    // return 'max-age=63072000; includeSubDomains; preload'; // Disabled for Render compatibility
    return '';
}

/**
 * Feature Policy / Permissions Policy
 */
export function getPermissionsPolicyHeader(): string {
    const policies = [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'camera=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=(self)',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=(self)',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()'
    ];

    return policies.join(', ');
}

/**
 * Expect-CT header (Certificate Transparency)
 */
export function getExpectCTHeader(): string {
    return 'max-age=86400, enforce';
}
