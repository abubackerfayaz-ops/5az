/**
 * Database query performance monitoring
 * Detects slow queries and potential security issues
 */

interface QueryLog {
    model: string;
    operation: string;
    query: any;
    duration: number;
    timestamp: Date;
}

const queryLogs: QueryLog[] = [];
const SLOW_QUERY_THRESHOLD = 1000; // 1 second
const MAX_LOGS = 100;

/**
 * Mongoose plugin to monitor all queries
 */
export function queryMonitorPlugin(schema: any) {
    schema.pre(/^find/, function (this: any) {
        this._startTime = Date.now();
    });

    schema.post(/^find/, function (this: any) {
        const duration = Date.now() - this._startTime;

        if (duration > SLOW_QUERY_THRESHOLD) {
            console.warn(`⚠️ SLOW QUERY DETECTED (${duration}ms):`, {
                model: this.model?.modelName,
                operation: this.op,
                query: this.getQuery()
            });
        }

        logQuery({
            model: this.model?.modelName || 'unknown',
            operation: this.op || 'unknown',
            query: this.getQuery(),
            duration,
            timestamp: new Date()
        });
    });
}

function logQuery(log: QueryLog) {
    queryLogs.push(log);

    if (queryLogs.length > MAX_LOGS) {
        queryLogs.shift();
    }
}

/**
 * Get query performance statistics
 */
export function getQueryStats() {
    if (queryLogs.length === 0) {
        return { count: 0, avgDuration: 0, slowQueries: [] };
    }

    const totalDuration = queryLogs.reduce((sum, log) => sum + log.duration, 0);
    const slowQueries = queryLogs
        .filter(log => log.duration > SLOW_QUERY_THRESHOLD)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

    return {
        count: queryLogs.length,
        avgDuration: totalDuration / queryLogs.length,
        slowQueries,
        byModel: groupByModel(queryLogs)
    };
}

function groupByModel(logs: QueryLog[]) {
    return logs.reduce((acc, log) => {
        if (!acc[log.model]) {
            acc[log.model] = { count: 0, totalDuration: 0 };
        }
        acc[log.model].count++;
        acc[log.model].totalDuration += log.duration;
        return acc;
    }, {} as Record<string, { count: number; totalDuration: number }>);
}

/**
 * Detect potential NoSQL injection in queries
 */
export function validateQuery(query: any): { safe: boolean; reason?: string } {
    const queryStr = JSON.stringify(query);

    // Check for dangerous operators
    const dangerousPatterns = [
        /\$where/i,
        /\$regex.*[\$\{\}]/,
        /javascript:/i,
        /eval\(/i,
        /function\s*\(/i
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(queryStr)) {
            return {
                safe: false,
                reason: `Query contains potentially dangerous pattern: ${pattern}`
            };
        }
    }

    return { safe: true };
}
