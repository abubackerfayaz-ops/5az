import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    try {
        const { amount, currency } = await request.json();

        const payment_capture = 1;
        const options = {
            amount: amount.toString(), // Amount in smallest currency unit (paise)
            currency,
            receipt: shortid.generate(),
            payment_capture,
        };

        const response = await razorpay.orders.create(options);

        return NextResponse.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
