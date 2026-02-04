import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';

interface SecurityEvent {
    type: 'honeypot' | 'brute_force' | 'injection_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'payment_fraud';
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip: string;
    userAgent: string;
    endpoint: string;
    details: any;
    timestamp: Date;
}

// In-memory store for recent events (would use Redis in production)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 1000;

/**
 * Log security events for monitoring and alerting
 */
export async function logSecurityEvent(event: SecurityEvent) {
    // Add to in-memory store
    securityEvents.push(event);

    // Keep only recent events
    if (securityEvents.length > MAX_EVENTS) {
        securityEvents.shift();
    }

    // Log to console with emoji indicators
    const emoji = {
        low: '⚠️',
        medium: '🔶',
        high: '🔴',
        critical: '🚨'
    }[event.severity];

    console.log(`${emoji} SECURITY EVENT [${event.type}] - ${event.severity.toUpperCase()}`);
    console.log(`   IP: ${event.ip}`);
    console.log(`   Endpoint: ${event.endpoint}`);
    console.log(`   Details:`, event.details);

    // Store in database for long-term analysis
    try {
        await dbConnect();
        const SecurityLog = (await import('@/models/SecurityLog')).default;
        await SecurityLog.create(event);
    } catch (error) {
        console.error('Failed to log security event to database:', error);
    }

    // Send alerts for critical events
    if (event.severity === 'critical') {
        await sendSecurityAlert(event);
    }

    // Check for attack patterns
    await detectAttackPatterns(event);
}

/**
 * Send real-time security alerts (integrate with Slack, Discord, email, etc.)
 */
async function sendSecurityAlert(event: SecurityEvent) {
    console.error('🚨 CRITICAL SECURITY ALERT!');
    console.error(JSON.stringify(event, null, 2));

    // TODO: Integrate with alerting services
    // - Send email via SendGrid/AWS SES
    // - Post to Slack webhook
    // - Send SMS via Twilio
    // - Create PagerDuty incident
}

/**
 * Detect attack patterns across multiple events
 */
async function detectAttackPatterns(event: SecurityEvent) {
    const recentEvents = securityEvents.filter(e =>
        e.ip === event.ip &&
        Date.now() - e.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Pattern: Multiple failed attempts
    if (recentEvents.length >= 10) {
        console.warn(`🚨 ATTACK PATTERN DETECTED: ${event.ip} has triggered ${recentEvents.length} security events in 5 minutes`);
        // Auto-block this IP
        await autoBlockIP(event.ip, 'Automated attack detection');
    }

    // Pattern: Scanning for vulnerabilities
    const uniqueEndpoints = new Set(recentEvents.map(e => e.endpoint));
    if (uniqueEndpoints.size >= 5) {
        console.warn(`🚨 VULNERABILITY SCAN DETECTED: ${event.ip} is probing multiple endpoints`);
        await autoBlockIP(event.ip, 'Vulnerability scanning');
    }
}

/**
 * Auto-block malicious IPs
 */
async function autoBlockIP(ip: string, reason: string) {
    try {
        await dbConnect();
        const BlockedIP = (await import('@/models/BlockedIP')).default;

        await BlockedIP.create({
            ip,
            reason,
            blockedAt: new Date(),
            blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            permanent: false
        });

        console.error(`🛡️ IP BLOCKED: ${ip} - Reason: ${reason}`);
    } catch (error) {
        console.error('Failed to block IP:', error);
    }
}

/**
 * Check if an IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
    try {
        await dbConnect();
        const BlockedIP = (await import('@/models/BlockedIP')).default;

        const blocked = await BlockedIP.findOne({
            ip,
            $or: [
                { permanent: true },
                { blockedUntil: { $gt: new Date() } }
            ]
        });

        return !!blocked;
    } catch (error) {
        console.error('Failed to check IP block status:', error);
        return false;
    }
}

/**
 * Get security event statistics
 */
export function getSecurityStats() {
    const now = Date.now();
    const last24h = securityEvents.filter(e => now - e.timestamp.getTime() < 86400000);

    return {
        total: securityEvents.length,
        last24h: last24h.length,
        byType: last24h.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        bySeverity: last24h.reduce((acc, e) => {
            acc[e.severity] = (acc[e.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        topIPs: getTopIPs(last24h)
    };
}

function getTopIPs(events: SecurityEvent[]): Array<{ ip: string; count: number }> {
    const ipCounts = events.reduce((acc, e) => {
        acc[e.ip] = (acc[e.ip] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
    return crypto.randomBytes(16).toString('hex');
}
