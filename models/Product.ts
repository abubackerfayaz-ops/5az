import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    team?: string;
    league?: string;
    color?: string;
    sizes: string[];
    inStock: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: { type: [String], required: true },
        category: { type: String, required: true }, // e.g., "Season 25-26", "Retro"
        team: { type: String }, // e.g., "Real Madrid"
        league: { type: String }, // e.g., "La Liga"
        color: { type: String }, // e.g., "White"
        sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
        inStock: { type: Boolean, default: true },
        slug: { type: String, unique: true, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
