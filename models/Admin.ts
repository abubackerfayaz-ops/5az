import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    permissions: string[];
    allowedIPs?: string[];
    isSuperAdmin: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        permissions: {
            type: [String],
            enum: ['MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'VIEW_PAYMENTS', 'MANAGE_USERS', 'VIEW_ANALYTICS'],
            default: []
        },
        allowedIPs: [{ type: String }],
        isSuperAdmin: { type: Boolean, default: false },
        lastLoginAt: { type: Date }
    },
    { timestamps: true }
);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ lastLoginAt: -1 });

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
