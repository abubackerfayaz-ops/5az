import mongoose, { Schema, Document } from 'mongoose';

/**
 * Cart Item - Embedded in Cart
 */
export interface ICartItem {
    variantId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
}

/**
 * Cart Model
 */
export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    updatedAt: Date;
}

const CartItemSchema = new Schema({
    variantId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const CartSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [CartItemSchema]
    },
    { timestamps: true }
);

// Indexes
CartSchema.index({ userId: 1 });

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
