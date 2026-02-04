import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    gateway: string;
    gatewayOrderId: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    amount: number;
    currency: string;
    status: 'CREATED' | 'SUCCESS' | 'FAILED';
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        gateway: { type: String, default: 'RAZORPAY', required: true },
        gatewayOrderId: { type: String, required: true, unique: true },
        gatewayPaymentId: { type: String },
        gatewaySignature: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: {
            type: String,
            enum: ['CREATED', 'SUCCESS', 'FAILED'],
            default: 'CREATED'
        },
        verifiedAt: { type: Date },
    },
    { timestamps: true }
);

PaymentSchema.index({ gatewayOrderId: 1 });
PaymentSchema.index({ orderId: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
