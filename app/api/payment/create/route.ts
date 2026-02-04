import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { advancedRateLimit, rateLimitResponse, getClientIP, detectSuspiciousActivity } from '@/lib/rate-limit';
import { detectReplayAttack, generateRequestFingerprint } from '@/lib/security';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';
import { orderSchema } from '@/lib/validations';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const CreateOrderSchema = orderSchema.extend({
    currency: z.string().default('INR')
});

export async function POST(request: Request) {
    try {
        const ip = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';

        // Detect suspicious activity
        if (detectSuspiciousActivity(ip, userAgent, '/api/payment/create')) {
            return NextResponse.json(
                { error: 'Suspicious activity detected' },
                { status: 403 }
            );
        }

        // Advanced rate limiting: 5 requests per minute
        const rateLimitResult = advancedRateLimit(ip, 'payment-create', 5, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.retryAfter);
        }

        const rawBody = await request.json();

        // Detect replay attacks
        const fingerprint = generateRequestFingerprint(request, rawBody);
        if (detectReplayAttack(fingerprint, 10000)) {
            console.warn(`🚨 Payment replay attack detected from ${ip}`);
            return NextResponse.json(
                { error: 'Duplicate request detected' },
                { status: 409 }
            );
        }

        const body = sanitizeInput(rawBody);
        const result = CreateOrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        const { items, currency } = result.data;

        await dbConnect();

        // Check for active session
        const session = await getServerSession(authOptions);
        // Use user ID from session if available, otherwise generate a new one for logging (but Order logic handles guest)
        const userId = session?.user
            ? new mongoose.Types.ObjectId((session.user as any).id)
            : new mongoose.Types.ObjectId();

        // Calculate total amount server-side to prevent tampering
        const productIds = items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        let totalAmount = 0;
        const itemsWithDetails = [];
        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.productId}` },
                    { status: 400 }
                );
            }
            if (!product.isActive) {
                return NextResponse.json(
                    { error: `Product not available: ${product.name}` },
                    { status: 400 }
                );
            }

            // Get price from the first variant (or find specific variant by size)
            const variant = product.variants.find((v: any) => v.attributes.get('Size') === item.size) || product.variants[0];
            const price = variant?.price?.amount || 0;

            totalAmount += price * item.quantity;

            // Verify stock (Strict Bank-Level check would lock row here, but for now we error if out of stock)
            if (variant.stockQuantity < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for: ${product.name} (Size: ${item.size})` },
                    { status: 400 }
                );
            }

            itemsWithDetails.push({
                productId: product._id,
                variantId: variant?._id || product._id,
                name: product.name,
                sku: variant?.sku || product.slug,
                price: price,
                quantity: item.quantity,
                size: item.size
            });
        }

        const payment_capture = 1;
        const options = {
            amount: Math.round(totalAmount * 100).toString(), // paise
            currency,
            receipt: shortid.generate(),
            payment_capture,
        };

        const response = await razorpay.orders.create(options);

        // Create Order in DB
        const dbOrder = await Order.create({
            userId: userId,
            isGuest: !session?.user,
            status: 'pending',
            items: itemsWithDetails,
            totals: {
                subtotal: totalAmount,
                tax: 0,
                shipping: 0,
                grandTotal: totalAmount
            },
            payment: {
                provider: 'RAZORPAY',
                transactionId: response.id,
                status: 'pending'
            },
            shipping: {
                address: body.shippingAddress
            }
        });

        // Create Payment in DB
        await Payment.create({
            orderId: dbOrder._id,
            gateway: 'RAZORPAY',
            gatewayOrderId: response.id,
            amount: totalAmount,
            currency: currency,
            status: 'CREATED'
        });

        return NextResponse.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
            dbOrderId: dbOrder._id
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
