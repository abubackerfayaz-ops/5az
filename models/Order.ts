import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
}

export interface IOrder extends Document {
    user?: mongoose.Types.ObjectId; // Optional for guest checkout
    guestInfo?: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'upi' | 'card' | 'cod';
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guestInfo: {
            name: String,
            email: String,
            phone: String,
            address: String,
        },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                size: { type: String, required: true },
                image: { type: String, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: { type: String, enum: ['upi', 'card', 'cod'], required: true },
        paymentId: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
