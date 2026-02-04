import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteConfig extends Document {
    key: string;
    organization: {
        name: string;
        url: string;
        logo: string;
        contactPoint?: {
            telephone: string;
            contactType: string;
        };
        sameAs: string[];
    };
    website: {
        name: string;
        url: string;
        searchTemplate?: string;
    };
}

const SiteConfigSchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true, default: 'seo_main' },
        organization: {
            name: { type: String, required: true },
            url: { type: String, required: true },
            logo: { type: String, required: true },
            contactPoint: {
                telephone: String,
                contactType: String,
            },
            sameAs: [String],
        },
        website: {
            name: { type: String, required: true },
            url: { type: String, required: true },
            searchTemplate: String,
        },
    },
    { timestamps: true }
);

export default mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
