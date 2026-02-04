import AuditLog from '@/models/AuditLog';
import { NextRequest } from 'next/server';

export async function logAudit(
    req: Request | NextRequest,
    actorId: string,
    actorRole: 'user' | 'admin' | 'guest',
    action: string,
    targetType: string,
    targetId?: string,
    details?: any
) {
    try {
        const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0];
        const userAgent = req.headers.get('user-agent') || 'unknown';

        await AuditLog.create({
            actorId,
            actorRole,
            action,
            targetType,
            targetId,
            ip,
            userAgent,
            details
        });
    } catch (error) {
        console.error('Failed to log audit event:', error);
    }
}
