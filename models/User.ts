import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'customer' | 'admin';
    image?: string;
    phone?: string;
    addresses?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        isDefault: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        image: { type: String },
        phone: { type: String },
        addresses: [
            {
                street: String,
                city: String,
                state: String,
                zipCode: String,
                isDefault: { type: Boolean, default: false }
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
