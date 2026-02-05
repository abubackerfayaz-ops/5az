import mongoose, { Schema, Document } from 'mongoose';

/**
 * User Model - Simple and Clean
 */
export interface IUser extends Document {
    email: string;
    password: string;
    name: {
        first: string;
        last: string;
    };
    phone?: string;
    role: 'customer' | 'admin';
    createdAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true }, // Keep this index
        password: { type: String, required: true, select: false },
        name: {
            first: { type: String, required: true },
            last: { type: String, required: true }
        },
        phone: { type: String },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
    },
    { timestamps: true }
);

// Indexes (removed duplicate - keeping only schema-level index)
// UserSchema.index({ email: 1 }); // Removed - already has unique: true in schema
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
