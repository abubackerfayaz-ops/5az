import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/security';
import { advancedRateLimit, rateLimitResponse, getClientIP } from '@/lib/rate-limit';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';

/**
 * Razorpay Webhook Handler
 * Handles payment notifications from Razorpay
 */
export async function POST(request: Request) {
    try {
        const ip = getClientIP(request);

        // Rate limiting for webhooks
        const rateLimitResult = advancedRateLimit(ip, 'webhook-razorpay', 100, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.retryAfter);
        }

        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature') || '';

        // Verify webhook signature
        if (!verifyWebhookSignature(
            body,
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!
        )) {
            console.warn(`🚫 Invalid webhook signature from ${ip}`);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);

        await dbConnect();

        // Handle different event types
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;

            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;

            case 'order.paid':
                await handleOrderPaid(event.payload.order.entity);
                break;

            default:
                console.log(`Unhandled webhook event: ${event.event}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handlePaymentCaptured(payment: any) {
    console.log(`💰 Payment captured: ${payment.id}`);

    await Payment.findOneAndUpdate(
        { gatewayPaymentId: payment.id },
        {
            status: 'captured',
            capturedAt: new Date(payment.created_at * 1000),
            amount: payment.amount / 100,
        },
        { upsert: true }
    );
}

async function handlePaymentFailed(payment: any) {
    console.log(`❌ Payment failed: ${payment.id}`);

    await Payment.findOneAndUpdate(
        { gatewayPaymentId: payment.id },
        {
            status: 'failed',
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
        },
        { upsert: true }
    );
}

async function handleOrderPaid(order: any) {
    console.log(`✅ Order paid: ${order.id}`);

    await Order.findOneAndUpdate(
        { gatewayOrderId: order.id },
        {
            status: 'PAID',
            paidAt: new Date(order.created_at * 1000),
        }
    );
}
