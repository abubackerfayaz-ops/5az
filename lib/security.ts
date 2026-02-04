import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Verify Razorpay webhook signature to prevent spoofing
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return false;
    }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
): boolean {
    try {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Payment signature verification failed:', error);
        return false;
    }
}

/**
 * Generate secure random token (for CSRF, API keys, etc.)
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Encrypt sensitive data (two-way) - requires encryption key
 */
export function encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(hashData(key).slice(0, 32)),
        iv
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(hashData(key).slice(0, 32)),
        iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Validate environment variables on startup
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
    const requiredVars = [
        'MONGODB_URI',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        return { valid: false, missing };
    }

    // Validate format
    const errors: string[] = [];

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
        errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }

    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
        errors.push('NEXTAUTH_SECRET must be at least 32 characters');
    }

    if (errors.length > 0) {
        console.error('❌ Environment variable validation errors:', errors.join(', '));
        return { valid: false, missing: errors };
    }

    console.log('✅ All required environment variables validated');
    return { valid: true, missing: [] };
}

/**
 * Generate request fingerprint for duplicate detection
 */
export function generateRequestFingerprint(request: Request, body?: any): string {
    const url = new URL(request.url);
    const data = [
        request.method,
        url.pathname,
        url.search,
        request.headers.get('user-agent') || '',
        body ? JSON.stringify(body) : '',
    ].join('|');

    return hashData(data);
}

/**
 * Detect request replay attacks
 */
const recentRequests = new Map<string, number>();

export function detectReplayAttack(fingerprint: string, windowMs: number = 5000): boolean {
    const now = Date.now();
    const lastSeen = recentRequests.get(fingerprint);

    if (lastSeen && now - lastSeen < windowMs) {
        console.warn('🚨 Potential replay attack detected');
        return true; // Duplicate request within window
    }

    recentRequests.set(fingerprint, now);

    // Cleanup old entries
    if (recentRequests.size > 1000) {
        for (const [key, timestamp] of recentRequests.entries()) {
            if (now - timestamp > windowMs) {
                recentRequests.delete(key);
            }
        }
    }

    return false;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
        return '***';
    }
    return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}
