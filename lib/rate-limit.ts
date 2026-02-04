import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockExpiry?: number;
}

interface FailedAttempt {
    count: number;
    firstAttempt: number;
    locked: boolean;
    lockExpiry?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const failedLoginAttempts = new Map<string, FailedAttempt>();
const suspiciousIPs = new Set<string>();

/**
 * Advanced rate limiting with exponential backoff and IP blocking
 */
export function advancedRateLimit(
    ip: string,
    endpoint: string,
    limit: number = 10,
    windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    // Check if IP is permanently blocked
    if (suspiciousIPs.has(ip)) {
        return { allowed: false, retryAfter: 3600 };
    }

    const entry = rateLimitMap.get(key);

    // If currently blocked, check if block expired
    if (entry?.blocked) {
        if (entry.blockExpiry && now < entry.blockExpiry) {
            return { allowed: false, retryAfter: Math.ceil((entry.blockExpiry - now) / 1000) };
        }
        // Block expired, reset
        rateLimitMap.delete(key);
    }

    // Initialize or get current entry
    const current = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs, blocked: false };

    // Reset if window expired
    if (now > current.resetTime) {
        current.count = 0;
        current.resetTime = now + windowMs;
        current.blocked = false;
    }

    current.count++;

    // Check if limit exceeded
    if (current.count > limit) {
        // Progressive blocking: 1 min, 5 min, 15 min, 1 hour
        const blockDuration = Math.min(60000 * Math.pow(3, Math.floor(current.count / limit)), 3600000);
        current.blocked = true;
        current.blockExpiry = now + blockDuration;

        // If repeatedly violating, add to suspicious list
        if (current.count > limit * 3) {
            suspiciousIPs.add(ip);
            console.warn(`🚨 IP ${ip} marked as suspicious (${current.count} requests)`);
        }

        rateLimitMap.set(key, current);
        return { allowed: false, retryAfter: Math.ceil(blockDuration / 1000) };
    }

    rateLimitMap.set(key, current);

    // Cleanup old entries periodically
    if (rateLimitMap.size > 10000) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (now > v.resetTime && !v.blocked) {
                rateLimitMap.delete(k);
            }
        }
    }

    return { allowed: true };
}

/**
 * Account lockout after failed login attempts
 */
export function trackFailedLogin(identifier: string): { locked: boolean; attemptsLeft?: number; lockExpiry?: number } {
    const now = Date.now();
    const maxAttempts = 5;
    const lockDuration = 15 * 60 * 1000; // 15 minutes
    const windowDuration = 30 * 60 * 1000; // 30 minutes

    const entry = failedLoginAttempts.get(identifier) || {
        count: 0,
        firstAttempt: now,
        locked: false
    };

    // Check if locked
    if (entry.locked && entry.lockExpiry) {
        if (now < entry.lockExpiry) {
            return {
                locked: true,
                lockExpiry: entry.lockExpiry
            };
        }
        // Lock expired, reset
        failedLoginAttempts.delete(identifier);
        return { locked: false, attemptsLeft: maxAttempts };
    }

    // Reset if window expired
    if (now - entry.firstAttempt > windowDuration) {
        entry.count = 0;
        entry.firstAttempt = now;
    }

    entry.count++;

    // Lock account if max attempts exceeded
    if (entry.count >= maxAttempts) {
        entry.locked = true;
        entry.lockExpiry = now + lockDuration;
        failedLoginAttempts.set(identifier, entry);

        console.warn(`🔒 Account locked: ${identifier} (${entry.count} failed attempts)`);

        return {
            locked: true,
            lockExpiry: entry.lockExpiry
        };
    }

    failedLoginAttempts.set(identifier, entry);
    return {
        locked: false,
        attemptsLeft: maxAttempts - entry.count
    };
}

/**
 * Reset failed login attempts on successful login
 */
export function resetFailedLoginAttempts(identifier: string) {
    failedLoginAttempts.delete(identifier);
}

/**
 * Check if IP is whitelisted for admin access
 */
export async function checkAdminIPWhitelist(ip: string, adminId: string): Promise<boolean> {
    try {
        await dbConnect();
        const Admin = (await import('@/models/Admin')).default;

        const admin = await Admin.findById(adminId);

        if (!admin || !admin.ipWhitelist || admin.ipWhitelist.length === 0) {
            // No whitelist configured, allow (but log warning)
            console.warn(`⚠️ No IP whitelist configured for admin ${adminId}`);
            return true;
        }

        // Allow if IP is whitelisted
        const allowed = admin.ipWhitelist.includes(ip) || admin.ipWhitelist.includes('*');

        if (!allowed) {
            console.warn(`🚫 Admin ${adminId} attempted access from non-whitelisted IP: ${ip}`);
        }

        return allowed;
    } catch (error) {
        console.error('IP whitelist check failed:', error);
        // Fail-open in case of error (but log it)
        return true;
    }
}

/**
 * Rate limit response with security headers
 */
export function rateLimitResponse(retryAfter?: number) {
    return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
            status: 429,
            headers: {
                'Retry-After': (retryAfter || 60).toString(),
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0'
            }
        }
    );
}

/**
 * Detect and log suspicious patterns
 */
export function detectSuspiciousActivity(ip: string, userAgent: string, endpoint: string): boolean {
    const suspicious = [
        !userAgent || userAgent.length < 10, // Missing or short user agent
        userAgent.toLowerCase().includes('bot') && !userAgent.includes('Googlebot'), // Non-Google bots
        userAgent.toLowerCase().includes('scanner'),
        userAgent.toLowerCase().includes('curl'),
        userAgent.toLowerCase().includes('wget'),
        endpoint.includes('..'), // Path traversal attempt
        endpoint.includes('<script'), // XSS attempt
        endpoint.includes('union select'), // SQL injection attempt (even though we use NoSQL)
    ];

    const isSuspicious = suspicious.some(condition => condition === true);

    if (isSuspicious) {
        console.warn(`🚨 Suspicious activity detected from ${ip} - ${userAgent} - ${endpoint}`);
        suspiciousIPs.add(ip);
    }

    return isSuspicious;
}

/**
 * Get client IP from request (handles proxies)
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP.trim();
    }

    return '127.0.0.1';
}

/**
 * Legacy function maintained for backward compatibility
 */
export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
    const result = advancedRateLimit(ip, 'legacy', limit, windowMs);
    return result.allowed;
}
