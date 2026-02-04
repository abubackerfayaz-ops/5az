import Navbar from "@/components/Navbar";
import { ArrowLeft, History, ShieldCheck, Zap, Globe, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import ProductActions from "@/components/ProductActions";

export const dynamic = "force-dynamic";

const fs = require('fs');
const path = require('path');

async function getProduct(id: string) {
    // Attempt DB first as priority
    try {
        await dbConnect();
        const product = await Product.findById(id).lean();
        if (product) return { ...product, _id: product._id.toString() };
    } catch (e) {
        console.error("DB Fetch failed, falling back to JSON:", e);
    }

    // Fallback to local JSON for stability
    try {
        const filePath = path.join(process.cwd(), 'scraped_products.json');
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const allProducts = JSON.parse(fileData);

            if (id.startsWith('local_')) {
                const index = parseInt(id.replace('local_', ''));
                if (allProducts[index]) {
                    return { ...allProducts[index], _id: id };
                }
            }
            const found = allProducts.find((p: any) => p._id === id);
            if (found) return found;
        }
    } catch (e) { console.error(e); }

    return null;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    // Adapt data structure if coming from raw sitemap JSON
    const displayImages = product.variants?.[0]?.images?.map((img: any) => img.url) || product.images || ["https://placehold.co/800x1000"];
    const displayName = product.name || "UNNAMED_UNIT";
    const displayCategory = product.categories?.[0]?.name || product.category || "CLASSIFIED";
    const displayDesc = product.description || "No archival data available for this specific unit. Technical specs verified for elite quality.";
    const displayPrice = product.variants?.[0]?.price?.amount || product.price || 0;
    const originalPrice = product.variants?.[0]?.price?.originalAmount || product.originalPrice;
    const sizes = product.variants?.[0]?.sizes || product.sizes || [];
    const inStock = product.isActive !== undefined ? product.isActive : true;

    return (
        <main className="min-h-screen bg-[#030303] text-white selection:bg-[#FF0080] pt-40 pb-60">
            <div className="bg-noise" />
            <div className="aurora-bg opacity-30" />
            <Navbar />

            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative">
                {/* Back Link - High Aesthetic */}
                <div className="mb-20">
                    <Link href="/shop" className="group inline-flex items-center gap-4 text-[11px] font-display font-black uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all">
                        <div className="w-12 h-12 glass-ultra rounded-full flex items-center justify-center transform group-hover:-translate-x-2 transition-transform">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        RETURN_TO_CATALOG
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 xl:gap-32 items-start">
                    {/* Visual Media Engine (Gallery) */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] bento-card border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] group overflow-hidden">
                            <Image
                                src={displayImages[0]}
                                alt={displayName}
                                fill
                                className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                                priority
                                quality={100}
                                unoptimized={true}
                            />
                            {/* Technical Overlay */}
                            <div className="absolute top-10 right-10 flex flex-col items-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white">UNIT_ID: #{id.slice(-6).toUpperCase()}</span>
                                <div className="w-24 h-[1px] bg-white/20" />
                            </div>

                            {/* Decorative Frame */}
                            <div className="absolute inset-0 border-[20px] border-[#030303]/20 pointer-events-none" />
                        </div>

                        {/* Secondary Vibe Blocks */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="bento-card p-10 flex items-center gap-8 bg-white/[0.01]">
                                <History className="w-10 h-10 text-[#FF0080]" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.4em]">Heritage_Log</span>
                                    <span className="text-sm font-display font-black uppercase tracking-widest leading-none">VINTAGE_CERTIFIED</span>
                                </div>
                            </div>
                            <div className="bento-card p-10 flex items-center gap-8 bg-white/[0.01]">
                                <Globe className="w-10 h-10 text-[#00FFFF]" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.4em]">Global_Intel</span>
                                    <span className="text-sm font-display font-black uppercase tracking-widest leading-none">NATIONWIDE_SYNC</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Archive Details (Actions & Info) */}
                    <div className="lg:col-span-5 flex flex-col gap-16 sticky top-40">
                        <div className="relative">
                            <div className="absolute -top-12 -left-8 text-[8vw] font-display font-black text-white/[0.02] tracking-tighter select-none pointer-events-none uppercase italic leading-none whitespace-nowrap">DETAIL_VIEW</div>

                            <div className="flex flex-col gap-8 relative z-10">
                                <div className="flex items-center gap-6">
                                    <span className="glass-ultra px-6 py-2 rounded-full text-[10px] font-mono font-black text-[#FF0080] uppercase tracking-[0.5em] border border-[#FF0080]/30 shadow-[0_0_20px_rgba(255,0,128,0.2)]">#UNIT_{displayCategory.toUpperCase()}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-20" />
                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Archival_Master_Copy</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-display font-black uppercase leading-[0.8] tracking-tighter chrome-text italic drop-shadow-2xl">
                                    {displayName}
                                </h1>
                            </div>
                        </div>

                        <ProductActions
                            id={id}
                            name={displayName}
                            price={displayPrice}
                            originalPrice={originalPrice}
                            image={displayImages[0]}
                            sizes={sizes}
                            inStock={inStock}
                        />

                        {/* Technical Intel / Description */}
                        <div className="bento-card p-12 bg-white/[0.01] border-white/10 mt-10">
                            <div className="flex items-center gap-6 mb-10 border-b border-white/5 pb-8">
                                <Cpu className="w-6 h-6 text-[#FF0080]" />
                                <h3 className="text-[11px] font-display font-black text-white uppercase tracking-[0.5em]">Intel_Repository</h3>
                            </div>
                            <p className="text-white/40 leading-relaxed font-sans text-lg italic pr-10">
                                "{displayDesc}"
                            </p>
                        </div>

                        <div className="flex items-center gap-10 opacity-30 mt-10">
                            <ShieldCheck className="w-8 h-8" />
                            <span className="text-[9px] font-mono font-bold text-white uppercase tracking-[0.5em]">Verified_by_5AZ_Technical_Log. v3.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
