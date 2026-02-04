import mongoose, { Schema, Document } from 'mongoose';

/**
 * Category Model - Simple Hierarchical
 */
export interface ICategory extends Document {
    name: string;
    slug: string;
    isActive: boolean;
    order: number;
    parentId: mongoose.Types.ObjectId | null;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null }
    },
    { bufferCommands: false }
);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
