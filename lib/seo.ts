import SiteConfig from '@/models/SiteConfig';
import Product from '@/models/Product';
import dbConnect from './mongodb';

export interface BreadcrumbItem {
    position: number;
    name: string;
    item: string;
}

/**
 * Generate Organization schema
 */
export async function generateOrganizationSchema() {
    await dbConnect();
    const config = await SiteConfig.findOne({ key: 'seo_main' });

    if (!config) return null;

    return {
        "@type": "Organization",
        "name": config.organization.name,
        "url": config.organization.url,
        "logo": {
            "@type": "ImageObject",
            "url": config.organization.logo
        },
        ...(config.organization.contactPoint && {
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": config.organization.contactPoint.telephone,
                "contactType": config.organization.contactPoint.contactType
            }
        }),
        ...(config.organization.sameAs && config.organization.sameAs.length > 0 && {
            "sameAs": config.organization.sameAs
        })
    };
}

/**
 * Generate WebSite schema with search functionality
 */
export async function generateWebSiteSchema() {
    await dbConnect();
    const config = await SiteConfig.findOne({ key: 'seo_main' });

    if (!config) return null;

    return {
        "@type": "WebSite",
        "name": config.website.name,
        "url": config.website.url,
        ...(config.website.searchTemplate && {
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": config.website.searchTemplate
                },
                "query-input": "required name=search_term_string"
            }
        })
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
    return {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map(crumb => ({
            "@type": "ListItem",
            "position": crumb.position,
            "name": crumb.name,
            "item": crumb.item
        }))
    };
}

/**
 * Generate Product schema with Offer and AggregateRating
 */
export async function generateProductSchema(productId: string, baseUrl: string) {
    await dbConnect();
    const product = await Product.findById(productId);

    if (!product) return null;

    const productUrl = `${baseUrl}/products/${product.slug}`;

    return {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images,
        "sku": product.sku || product._id.toString(),
        "brand": {
            "@type": "Brand",
            "name": product.brand || "5AZ"
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "INR",
            "price": product.price.toString(),
            "availability": product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            ...(product.originalPrice && {
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
        }
    };
}

/**
 * Generate complete JSON-LD for a product page
 */
export async function generateProductPageSchema(productId: string, baseUrl: string) {
    const organization = await generateOrganizationSchema();
    const website = await generateWebSiteSchema();
    const product = await generateProductSchema(productId, baseUrl);

    if (!product) return null;

    const productData = await Product.findById(productId);

    const breadcrumbs = generateBreadcrumbSchema([
        { position: 1, name: "Home", item: baseUrl },
        { position: 2, name: productData?.category || "Shop", item: `${baseUrl}/shop?category=${productData?.category}` },
        { position: 3, name: productData?.name || "Product", item: `${baseUrl}/products/${productData?.slug}` }
    ]);

    return {
        "@context": "https://schema.org",
        "@graph": [
            organization,
            website,
            breadcrumbs,
            product
        ].filter(Boolean)
    };
}

/**
 * Generate JSON-LD for homepage
 */
export async function generateHomepageSchema(baseUrl: string) {
    const organization = await generateOrganizationSchema();
    const website = await generateWebSiteSchema();

    return {
        "@context": "https://schema.org",
        "@graph": [
            organization,
            website
        ].filter(Boolean)
    };
}
