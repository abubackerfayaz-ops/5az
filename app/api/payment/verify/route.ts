import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyPaymentSignature, detectReplayAttack, generateRequestFingerprint } from '@/lib/security';
import { advancedRateLimit, rateLimitResponse, getClientIP } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { paymentVerifySchema } from '@/lib/validations';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';

export async function POST(request: Request) {
    try {
        // Get client IP
        const ip = getClientIP(request);

        // Rate limiting: 10 verifications per minute
        const rateLimitResult = advancedRateLimit(ip, 'payment-verify', 10, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.retryAfter);
        }

        const rawBody = await request.json();

        // Sanitize input
        const body = sanitizeInput(rawBody);

        // Validate schema
        const validation = paymentVerifySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        // Detect replay attacks
        const fingerprint = generateRequestFingerprint(request, body);
        if (detectReplayAttack(fingerprint, 10000)) {
            console.warn(`🚨 Replay attack detected from ${ip}`);
            return NextResponse.json(
                { error: 'Duplicate request detected' },
                { status: 409 }
            );
        }

        // Verify signature using timing-safe comparison (HMAC-SHA256)
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            process.env.RAZORPAY_KEY_SECRET!
        );

        if (isValid) {
            console.log(`✅ Payment verified: ${razorpay_payment_id}`);

            await dbConnect();

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 1. Update Payment record (Atomic Lock)
                const payment = await Payment.findOneAndUpdate(
                    { gatewayOrderId: razorpay_order_id },
                    {
                        gatewayPaymentId: razorpay_payment_id,
                        gatewaySignature: razorpay_signature,
                        status: 'SUCCESS',
                        verifiedAt: new Date()
                    },
                    { new: true, session }
                );

                if (!payment) {
                    throw new Error('Payment record not found for verification');
                }

                // 2. Update Order record
                const order = await Order.findByIdAndUpdate(
                    payment.orderId,
                    {
                        status: 'paid',
                        'payment.status': 'paid',
                        'payment.transactionId': razorpay_payment_id
                    },
                    { session }
                );

                if (!order) {
                    throw new Error('Associated order not found');
                }

                await session.commitTransaction();
                return NextResponse.json({
                    status: 'success',
                    message: 'Payment verified securely'
                });

            } catch (err) {
                await session.abortTransaction();
                throw err;
            } finally {
                session.endSession();
            }

        } else {
            console.warn(`🚫 Invalid payment signature from ${ip}`);
            // Return generic error to avoid leaking verification logic details
            return NextResponse.json({
                status: 'error',
                message: 'Verification failed'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Internal Processing Error' },
            { status: 500 }
        );
    }
}
