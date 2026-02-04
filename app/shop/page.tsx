import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Filter, ChevronRight, Search, LayoutGrid, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

async function getShopData(params: any) {
    try {
        const conn = await dbConnect();
        if (!conn) {
            console.error("Database connection failed in getShopData");
            return { products: [], categories: [] };
        }

        let query: any = { isActive: true };

        if (params?.category) {
            const cat = await Category.findOne({ name: params.category }).lean() as any;
            if (cat) {
                query.$or = [
                    { categories: cat._id },
                    { category: params.category }
                ];
            } else {
                query.category = params.category;
            }
        }

        if (params?.league) {
            query.league = params.league;
        }

        if (params?.team) {
            query.team = { $regex: params.team, $options: 'i' };
        }

        if (params?.search) {
            query.name = { $regex: params.search, $options: 'i' };
        }

        const [products, total, categories] = await Promise.all([
            Product.find(query).sort({ createdAt: -1 }).lean(),
            Product.countDocuments(query),
            Category.find({ isActive: true }).sort({ order: 1 }).lean()
        ]);

        return { products, total, categories };
    } catch (error) {
        console.error("Critical error in getShopData:", error);
        return { products: [], categories: [] };
    }
}

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; league?: string; team?: string; search?: string }>
}) {
    const params = await searchParams;
    const { products, categories, total } = await getShopData(params);
    const activeFilterName = params.category || params.search || params.league || "ALL";

    return (
        <main className="min-h-screen bg-[#030303] selection:bg-[#FF0080] selection:text-white pt-40">
            <div className="bg-noise" />
            <div className="aurora-bg opacity-30" />
            <Navbar />

            {/* Cinematic Shop Header */}
            <div className="px-6 md:px-12 max-w-screen-2xl mx-auto mb-32 relative">
                <div className="absolute -top-20 right-10 text-[20vw] font-display font-black text-white/[0.01] tracking-tighter select-none pointer-events-none uppercase italic">STORE</div>

                <div className="flex flex-col gap-10 relative z-10">
                    <div className="flex items-center gap-4 text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.5em]">
                        <Link href="/" className="hover:text-[#FF0080] transition-colors">VANGUARD</Link>
                        <ChevronRight className="w-3 h-3 text-[#FF0080]" />
                        <span className="text-white">{activeFilterName}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <h1 className="text-6xl md:text-[10vw] font-display font-black uppercase text-white tracking-tighter leading-[0.75] italic">
                            The <span className="chrome-text">Catalog.</span>
                        </h1>
                        <div className="flex items-center gap-10 glass-ultra px-8 py-5 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-[#FF0080] uppercase tracking-[0.4em] mb-2">UNITS_LOCATED</span>
                                <span className="text-3xl font-display font-black text-white leading-none">{products.length.toString().padStart(2, '0')}</span>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl glass-ultra flex items-center justify-center text-[#FF0080]">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-24 pb-60">
                {/* Fixed Control Aesthetic Sidebar */}
                <aside className="w-full lg:w-96 flex-shrink-0">
                    <div className="sticky top-40 space-y-20">
                        {/* Search Index */}
                        <div className="relative group">
                            <span className="text-[10px] font-mono font-black text-[#FF0080] uppercase tracking-[0.6em] mb-6 block flex items-center gap-3">
                                <Search className="w-3 h-3" /> SEARCH_REPOSITORY
                            </span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="QUERY_PROTOCOL..."
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl px-8 py-6 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-[#FF0080]/50 transition-all shadow-inner placeholder:opacity-20"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg glass-ultra flex items-center justify-center text-white/20">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Collections / Categories */}
                        <div className="bento-card p-10 bg-white/[0.01]">
                            <h3 className="text-[10px] font-display font-black uppercase tracking-[0.5em] mb-12 text-[#00FFFF] border-b border-[#00FFFF]/20 pb-6 flex items-center justify-between">
                                CATEGORY_INDEX
                                <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-ping" />
                            </h3>
                            <ul className="space-y-8">
                                <li>
                                    <Link href="/shop" className={`flex items-center justify-between text-[11px] font-display font-black uppercase tracking-widest hover:text-[#FF0080] transition-all group ${!params.category ? 'text-[#FF0080]' : 'text-white/40'}`}>
                                        <span className="flex items-center gap-4">
                                            <div className={`w-1 h-1 rounded-full ${!params.category ? 'bg-[#FF0080]' : 'bg-white/10 group-hover:bg-[#FF0080]'}`} />
                                            ALL
                                        </span>
                                        <span className="font-mono opacity-20 group-hover:opacity-100">{total}</span>
                                    </Link>
                                </li>
                                {["NATIONS", "CLUBS", "RETRO", "SPECIALS", "NEW_KITS"].map((catName) => (
                                    <li key={catName}>
                                        <Link href={`/shop?category=${catName}`} className={`flex items-center justify-between text-[11px] font-display font-black uppercase tracking-widest hover:text-[#FF0080] transition-all group ${params.category === catName ? 'text-[#FF0080]' : 'text-white/40'}`}>
                                            <span className="flex items-center gap-4">
                                                <div className={`w-1 h-1 rounded-full ${params.category === catName ? 'bg-[#FF0080]' : 'bg-white/10 group-hover:bg-[#FF0080]'}`} />
                                                {catName}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Aesthetic Intel Block */}
                        <div className="bento-card p-10 bg-[#FF0080]/5 border-[#FF0080]/20">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#FF0080] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,0,128,0.4)]">
                                        <Zap className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white">Express_Intel</span>
                                </div>
                                <p className="text-[11px] font-medium text-white/50 leading-relaxed italic">
                                    "The technical archive is updated every 48 hours. Secure your units before repository lock."
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Product Repository Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24 md:gap-x-16 md:gap-y-32">
                        {products.length > 0 ? (
                            products.map((product: any) => (
                                <ProductCard
                                    key={product._id.toString()}
                                    id={product._id.toString()}
                                    name={product.name}
                                    price={product.variants[0]?.price?.amount || 0}
                                    originalPrice={product.variants[0]?.price?.originalAmount}
                                    image={product.variants[0]?.images[0]?.url}
                                    category={product.category || product.categories?.[0]?.name || "Verified_Unit"}
                                    brand={product.brand}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-60 text-center glass-ultra rounded-[4rem] border border-dashed border-white/5">
                                <div className="text-6xl md:text-8xl font-display font-black text-white/5 uppercase tracking-tighter mb-8 italic">NULL_RESPONSE</div>
                                <p className="text-[#FF0080] font-mono text-[11px] uppercase tracking-[0.5em] mb-12">No data matching query parameters found in the vault.</p>
                                <Link href="/shop" className="group relative px-12 py-6 rounded-full glass-ultra text-white font-display font-black uppercase tracking-[0.4em] text-[10px] inline-flex items-center gap-6 hover:bg-white hover:text-black transition-all">
                                    Reset Archive Sync <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Aesthetic Page Footer */}
            <footer className="py-40 bg-[#050505] border-t border-white/5">
                <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-12 opacity-30">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.6em]">Authorized_Shop_Interface // v3.0.1</span>
                    <div className="flex items-center gap-12 text-[10px] font-display font-black uppercase tracking-widest">
                        <Link href="/terms">Terms_Of_Service</Link>
                        <Link href="/privacy">Privacy_Protocol</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
