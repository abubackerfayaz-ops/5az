import { NextResponse } from 'next/server';
import { getSecurityStats } from '@/lib/security-monitor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SecurityLog from '@/models/SecurityLog';
import BlockedIP from '@/models/BlockedIP';

/**
 * Security monitoring dashboard API
 * Only accessible by admins
 */
export async function GET(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session || (session as any).user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'stats') {
            // Get real-time stats
            const memoryStats = getSecurityStats();

            // Get database stats
            const [
                totalLogs,
                criticalEvents,
                last24hEvents,
                blockedIPs
            ] = await Promise.all([
                SecurityLog.countDocuments(),
                SecurityLog.countDocuments({ severity: 'critical', resolved: false }),
                SecurityLog.countDocuments({
                    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }),
                BlockedIP.countDocuments({ unblocked: false })
            ]);

            return NextResponse.json({
                memory: memoryStats,
                database: {
                    totalLogs,
                    criticalEvents,
                    last24hEvents,
                    blockedIPs
                }
            });
        }

        if (action === 'recent') {
            const limit = parseInt(searchParams.get('limit') || '50');
            const events = await SecurityLog.find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();

            return NextResponse.json({ events });
        }

        if (action === 'blocked-ips') {
            const blockedIPs = await BlockedIP.find({ unblocked: false })
                .sort({ blockedAt: -1 })
                .lean();

            return NextResponse.json({ blockedIPs });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Security monitor error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch security data' },
            { status: 500 }
        );
    }
}

/**
 * Manually block or unblock IPs
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session as any).user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { action, ip, reason } = await request.json();

        if (action === 'block') {
            await BlockedIP.create({
                ip,
                reason: reason || 'Manual block',
                blockedBy: 'manual',
                permanent: true,
                blockedAt: new Date()
            });

            return NextResponse.json({ success: true, message: 'IP blocked' });
        }

        if (action === 'unblock') {
            await BlockedIP.findOneAndUpdate(
                { ip },
                {
                    unblocked: true,
                    unblockedAt: new Date(),
                    unblockedBy: (session as any).user.email
                }
            );

            return NextResponse.json({ success: true, message: 'IP unblocked' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Security action error:', error);
        return NextResponse.json(
            { error: 'Operation failed' },
            { status: 500 }
        );
    }
}
