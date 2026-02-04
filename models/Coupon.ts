import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'PERCENT' | 'FLAT';
    discountValue: number;
    minOrderAmount: number;
    maxDiscount?: number;
    usageLimit: number;
    usedCount: number;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        discountType: { type: String, enum: ['PERCENT', 'FLAT'], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minOrderAmount: { type: Number, default: 0, min: 0 },
        maxDiscount: { type: Number, min: 0 },
        usageLimit: { type: Number, default: 1, min: 1 },
        usedCount: { type: Number, default: 0, min: 0 },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
