import mongoose, { Schema, Document } from 'mongoose';

/**
 * Order Item - SNAPSHOT DATA
 */
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
    name: string;
    sku: string;
    price: number;
    quantity: number;
}

/**
 * Order Model - Snapshot Pricing
 */
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    status: 'pending' | 'paid' | 'shipped' | 'delivered';
    items: IOrderItem[];
    totals: {
        subtotal: number;
        tax: number;
        shipping: number;
        grandTotal: number;
    };
    payment: {
        provider: string;
        transactionId: string;
        status: string;
    };
    shipping: {
        address: Record<string, any>;
        carrier?: string;
        trackingNumber?: string;
    };
    fulfillment?: {
        supplierOrderId?: string;
        supplierStatus: 'unfulfilled' | 'pending' | 'ordered' | 'shipped';
        costPrice?: number;
        profit?: number;
        lastUpdated?: Date;
    };
    createdAt: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const FulfillmentSchema = new Schema({
    supplierOrderId: { type: String },
    supplierStatus: {
        type: String,
        enum: ['unfulfilled', 'pending', 'ordered', 'shipped'],
        default: 'unfulfilled'
    },
    costPrice: { type: Number },
    profit: { type: Number },
    lastUpdated: { type: Date }
}, { _id: false });

const OrderSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered'],
            default: 'pending'
        },
        items: [OrderItemSchema],
        totals: {
            subtotal: { type: Number, required: true },
            tax: { type: Number, required: true },
            shipping: { type: Number, required: true },
            grandTotal: { type: Number, required: true }
        },
        payment: {
            provider: { type: String, required: true },
            transactionId: { type: String },
            status: { type: String, required: true }
        },
        shipping: {
            address: { type: Schema.Types.Mixed, required: true },
            carrier: { type: String },
            trackingNumber: { type: String }
        },
        fulfillment: FulfillmentSchema
    },
    { timestamps: true }
);

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
