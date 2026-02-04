import { NextResponse } from 'next/server';

/**
 * Honeypot endpoints to trap malicious bots
 * These look like real admin/sensitive endpoints but are fake
 */

// Honeypot: Fake admin login
export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.error(`🚨 HONEYPOT TRIGGERED - Malicious access attempt detected!`);
    console.error(`   IP: ${ip}`);
    console.error(`   User-Agent: ${userAgent}`);
    console.error(`   Endpoint: /api/admin-legacy/route.ts`);
    console.error(`   Time: ${new Date().toISOString()}`);

    // Log to security monitoring service (e.g., Sentry, Datadog)
    // await logSecurityEvent('honeypot_triggered', { ip, userAgent, endpoint: '/api/admin-legacy' });

    // Block this IP immediately
    // await blockIP(ip);

    // Return fake success to waste attacker's time
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay 3 seconds

    return NextResponse.json(
        {
            success: true,
            message: 'Login successful',
            redirect: '/admin/dashboard'
        },
        { status: 200 }
    );
}

export async function GET(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    console.error(`🚨 HONEYPOT: Bot detected at /api/admin-legacy from ${ip}`);

    // Return fake admin panel HTML
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Admin Panel</title></head>
        <body>
            <h1>Admin Login</h1>
            <form method="POST">
                <input type="text" name="username" placeholder="Username">
                <input type="password" name="password" placeholder="Password">
                <button type="submit">Login</button>
            </form>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
}
