import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    actorId: string;
    actorRole: 'user' | 'admin' | 'guest';
    action: string;
    targetType: string;
    targetId?: string;
    ip: string;
    userAgent: string;
    details?: any;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
    {
        actorId: { type: String, required: true },
        actorRole: { type: String, enum: ['user', 'admin', 'guest'], required: true },
        action: { type: String, required: true },
        targetType: { type: String, required: true },
        targetId: { type: String },
        ip: { type: String, required: true },
        userAgent: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for faster forensic searches
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
