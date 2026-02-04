import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityLog extends Document {
    type: 'honeypot' | 'brute_force' | 'injection_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'payment_fraud';
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip: string;
    userAgent: string;
    endpoint: string;
    details: Record<string, any>;
    timestamp: Date;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
}

const SecurityLogSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['honeypot', 'brute_force', 'injection_attempt', 'rate_limit_exceeded', 'suspicious_activity', 'payment_fraud']
        },
        severity: {
            type: String,
            required: true,
            enum: ['low', 'medium', 'high', 'critical'],
            index: true
        },
        ip: { type: String, required: true, index: true },
        userAgent: { type: String, required: true },
        endpoint: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now, index: true },
        resolved: { type: Boolean, default: false },
        resolvedBy: String,
        resolvedAt: Date
    },
    { timestamps: true }
);

// Compound index for querying
SecurityLogSchema.index({ ip: 1, timestamp: -1 });
SecurityLogSchema.index({ type: 1, severity: 1 });

export default mongoose.models.SecurityLog || mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);
