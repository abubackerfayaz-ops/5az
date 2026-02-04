import mongoose, { Schema, Document } from 'mongoose';

/**
 * Product Variant - Embedded in Product
 */
export interface IProductVariant {
    _id: mongoose.Types.ObjectId;
    sku: string;
    attributes: Record<string, string>; // e.g., { Size: "M", Color: "Black" }
    price: {
        amount: number;
        originalAmount?: number;
        currency: string;
    };
    inventory: {
        quantity: number;
    };
    images: Array<{
        url: string;
        isPrimary: boolean;
    }>;
    vendorPrice?: number; // The price at the supplier site
}

/**
 * Product Attribute Definition
 */
export interface IProductAttribute {
    name: string; // e.g., "Size", "Color"
    values: string[]; // e.g., ["S", "M", "L"]
}

/**
 * Product Model - Variant-First Design
 */
export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    brand: string;
    categories: mongoose.Types.ObjectId[];
    attributes: IProductAttribute[];
    variants: IProductVariant[];
    isActive: boolean;
    supplierUrl?: string; // Link to the product on the supplier's site
    createdAt: Date;
    updatedAt: Date;
}

const ProductVariantSchema = new Schema({
    sku: { type: String, required: true, unique: true },
    attributes: {
        type: Map,
        of: String,
        required: true
    },
    price: {
        amount: { type: Number, required: true, min: 0 },
        originalAmount: { type: Number, min: 0 },
        currency: { type: String, default: 'INR' }
    },
    inventory: {
        quantity: { type: Number, required: true, default: 0, min: 0 }
    },
    images: [{
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
    }],
    vendorPrice: { type: Number }
}, { _id: true });

const ProductAttributeSchema = new Schema({
    name: { type: String, required: true },
    values: [{ type: String, required: true }]
}, { _id: false });


const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String },
        categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        attributes: [ProductAttributeSchema],
        variants: [ProductVariantSchema],
        isActive: { type: Boolean, default: true },
        supplierUrl: { type: String }
    },
    { timestamps: true, bufferCommands: false }
);

// Indexes
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ isActive: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
