import { NextResponse } from 'next/server';
import { getDbStats, dbHealthCheck } from '@/lib/mongodb';
import { getRedisClient } from '@/lib/cache';
import { getQueueStats } from '@/lib/queue';

/**
 * Health check endpoint for monitoring and load balancers
 * Returns comprehensive system health status
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    const startTime = Date.now();

    try {
        // Basic health check
        const checks = await Promise.allSettled([
            dbHealthCheck(),
            checkRedis(),
            checkDisk()
        ]);

        const [dbCheck, redisCheck, diskCheck] = checks.map(r =>
            r.status === 'fulfilled' ? r.value : { healthy: false, error: r.reason }
        );

        const healthy = dbCheck.healthy && redisCheck.healthy && diskCheck.healthy;
        const responseTime = Date.now() - startTime;

        const response: any = {
            status: healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime,
            checks: {
                database: dbCheck,
                redis: redisCheck,
                disk: diskCheck
            }
        };

        // Detailed metrics (for monitoring dashboards)
        if (detailed) {
            const [dbStats, queueStats, memoryUsage] = await Promise.all([
                getDbStats(),
                getQueueStats(),
                getMemoryUsage()
            ]);

            response.metrics = {
                database: dbStats,
                queue: queueStats,
                memory: memoryUsage,
                process: {
                    pid: process.pid,
                    version: process.version,
                    platform: process.platform
                }
            };
        }

        return NextResponse.json(response, {
            status: healthy ? 200 : 503,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: 'Health check failed',
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        );
    }
}

async function checkRedis(): Promise<{ healthy: boolean; latency?: number }> {
    const start = Date.now();

    try {
        const redis = await getRedisClient();
        await redis.ping?.() || true; // Mock client doesn't have ping

        return {
            healthy: true,
            latency: Date.now() - start
        };
    } catch (error) {
        return { healthy: false };
    }
}

async function checkDisk(): Promise<{ healthy: boolean; available?: number }> {
    // In production, check disk space
    // For now, always return healthy
    return { healthy: true, available: 100 };
}

async function getMemoryUsage() {
    const usage = process.memoryUsage();

    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
    };
}
