import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedIP extends Document {
    ip: string;
    reason: string;
    blockedAt: Date;
    blockedUntil?: Date;
    permanent: boolean;
    blockedBy: 'auto' | 'manual';
    unblocked: boolean;
    unblockedAt?: Date;
    unblockedBy?: string;
}

const BlockedIPSchema: Schema = new Schema(
    {
        ip: { type: String, required: true, unique: true, index: true },
        reason: { type: String, required: true },
        blockedAt: { type: Date, default: Date.now },
        blockedUntil: { type: Date },
        permanent: { type: Boolean, default: false },
        blockedBy: { type: String, enum: ['auto', 'manual'], default: 'auto' },
        unblocked: { type: Boolean, default: false },
        unblockedAt: Date,
        unblockedBy: String
    },
    { timestamps: true }
);

// Index for quick blocking checks
BlockedIPSchema.index({ ip: 1, unblocked: 1 });
BlockedIPSchema.index({ blockedUntil: 1 });

export default mongoose.models.BlockedIP || mongoose.model<IBlockedIP>('BlockedIP', BlockedIPSchema);
