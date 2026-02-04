import Link from 'next/link';
import Image from 'next/image';
import { Zap, ShieldCheck, Shield, Truck, RotateCcw, ArrowRight, Sparkles, Instagram, Twitter, Globe, History, LayoutGrid, Cpu, Layers, Fingerprint, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CategoryExplorer from '@/components/CategoryExplorer';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  const defaultData = {
    activeCategories: [{ name: "All", filter: "", color: "text-white" }],
    productsByFilter: { "": [] as any[] }
  };

  // Local fallback (always serializable)
  const getFallback = async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'scraped_os.json');
      if (!fs.existsSync(filePath)) return defaultData;

      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const allProducts = (raw || []).filter((p: any) => p && p.isActive !== false).map((p: any, idx: number) => ({
        _id: p.slug || `local_${idx}`,
        name: p.name,
        variants: [
          {
            price: {
              amount: Number(p.price) || 0,
              originalAmount: p.originalPrice != null ? Number(p.originalPrice) : undefined,
            },
            images: Array.isArray(p.images) ? p.images.map((url: string) => ({ url })) : [],
          },
        ],
        __category: p.category || "",
        brand: p.brand,
      }));

      const filterNames = ["NATIONS", "CLUBS", "RETRO", "SPECIALS", "NEW_KITS"];
      const productsByFilter: Record<string, any[]> = { "ALL": allProducts.slice(0, 12) };

      for (const name of filterNames) {
        productsByFilter[name] = allProducts.filter((p: any) =>
          (p.__category && p.__category.toUpperCase().includes(name)) ||
          (p.name && p.name.toUpperCase().includes(name))
        ).slice(0, 12);
      }

      const activeCategories = [
        { name: "ALL", filter: "ALL", color: "text-white" },
        ...filterNames.map(name => ({ name, filter: name, color: "text-white" }))
      ];

      // Remove helper field to keep props clean
      for (const key of Object.keys(productsByFilter)) {
        productsByFilter[key] = productsByFilter[key].map(({ __category, ...rest }: any) => rest);
      }

      return { activeCategories, productsByFilter };
    } catch (e) {
      console.error('Homepage fallback data load failed:', e);
      return defaultData;
    }
  };

  // Try DB first, but never block the homepage
  try {
    await dbConnect();
    const categories: any[] = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    const allProductsRaw = await Product.find({ isActive: true }).limit(20).sort({ createdAt: -1 }).lean();
    const mapDbProduct = (p: any) => {
      const v0 = p?.variants?.[0];
      return {
        _id: p?._id?.toString?.() ?? String(p?._id ?? ''),
        name: p?.name ?? '',
        variants: [
          {
            price: {
              amount: Number(v0?.price?.amount) || 0,
              originalAmount: v0?.price?.originalAmount != null ? Number(v0?.price?.originalAmount) : undefined,
            },
            images: Array.isArray(v0?.images) ? v0.images.map((img: any) => ({ url: img?.url ?? '' })) : [],
          },
        ],
        category: p.category || "Official",
        brand: p.brand,
      };
    };
    const allProducts: any[] = allProductsRaw.map(mapDbProduct);

    const filterNames = ["NATIONS", "CLUBS", "RETRO", "SPECIALS", "NEW_KITS"];
    const productsByFilter: any = { "ALL": allProducts.slice(0, 12) };

    const activeCategories = [
      { name: "ALL", filter: "ALL", color: "text-white" },
      ...filterNames.map(name => ({
        name,
        filter: name,
        color: "text-white"
      }))
    ];

    for (const name of filterNames) {
      const catProductsRaw = await Product.find({
        isActive: true,
        $or: [
          { category: new RegExp(name, 'i') },
          { name: new RegExp(name, 'i') },
          { description: new RegExp(name, 'i') }
        ]
      }).limit(12).sort({ createdAt: -1 }).lean();

      productsByFilter[name] = catProductsRaw.map(mapDbProduct);
    }

    return { activeCategories, productsByFilter };
  } catch (error) {
    console.error('Homepage data fetch failed, using fallback:', error);
    return await getFallback();
  }
}

export default async function Home() {
  const { activeCategories, productsByFilter } = await getHomepageData();

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-[#FF0080]">
      <div className="relative z-10 pt-40">
        <Navbar />

        {/* HERO SECTION - Visual Entry */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-[#030303]">
            <div className="absolute inset-0 cyber-grid opacity-5" />

            {/* Floating Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#FF0080]/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#D9FF00]/15 rounded-full blur-[130px] animate-pulse delay-1000" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-[#00FFFF]/15 rounded-full blur-[120px] animate-pulse delay-500" style={{ animationDelay: '1s' }} />

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-[1px] bg-white/20 mb-12" style={{ marginTop: `${i * 5}vh` }} />
              ))}
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-screen-2xl mx-auto px-6 md:px-12 text-center">
            <div className="flex flex-col items-center gap-12">

              {/* Eyebrow */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#D9FF00] to-transparent" />
                <span className="text-[10px] font-mono font-black text-[#D9FF00] tracking-[0.6em] uppercase">EST_2024 // Premium Archive</span>
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#D9FF00] to-transparent" />
              </div>

              {/* Main Headline */}
              <h1 className="text-7xl md:text-[14vw] font-display font-black uppercase leading-[0.75] tracking-tighter max-w-6xl">
                <span className="block chrome-text italic mb-4">FOR THE</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] via-[#D9FF00] to-[#00FFFF] animate-gradient-x">
                  CULTURE
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-2xl font-aesthetic font-medium text-white/60 max-w-3xl leading-relaxed italic">
                Curated football kits for those who understand the game beyond the pitch. Authentic. Verified. Timeless.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
                <Link href="/shop" className="group relative px-16 py-6 rounded-full bg-white text-black font-display font-black uppercase tracking-[0.3em] text-[11px] overflow-hidden transition-all duration-700 hover:scale-105 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D9FF00] to-[#00FFFF] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                  <span className="relative z-10 group-hover:text-black">Explore Archive</span>
                </Link>

                <Link href="/shop?category=RETRO" className="group px-16 py-6 rounded-full glass-ultra border border-white/10 text-white font-display font-black uppercase tracking-[0.3em] text-[11px] hover:border-[#FF0080]/40 transition-all duration-700 hover:scale-105 shadow-2xl">
                  <span className="group-hover:text-[#FF0080] transition-colors">Retro Vault</span>
                </Link>
              </div>

              {/* Floating Stats */}
              <div className="flex flex-wrap items-center justify-center gap-16 mt-20 opacity-40">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-display font-black text-white">61</span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.5em]">Units</span>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-display font-black text-white">100%</span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.5em]">Verified</span>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-display font-black text-white">5K+</span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.5em]">Community</span>
                </div>
              </div>

            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce">
            <span className="text-[8px] font-mono font-black text-white/40 uppercase tracking-[0.5em]">Scroll</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* SECTION 2: THE CATALOG HUB (Aesthetic Home Section 2) */}
        <section className="py-20 relative px-6 md:px-12 bg-gradient-to-b from-[#030303] to-[#050505]">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="flex flex-col mb-16 relative">
              <h2 className="flex flex-col items-start leading-none group">
                <span className="text-[4vw] md:text-[2.5vw] font-accent italic font-black text-white/20 tracking-[0.4em] uppercase mb-4 group-hover:text-[#D9FF00]/40 transition-colors duration-700">Premium</span>
                <span className="text-7xl md:text-[10vw] font-display font-black tracking-tighter uppercase text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] -mb-[1vw]">Archive</span>
                <div className="flex items-center gap-8">
                  <span className="text-6xl md:text-[8vw] font-display font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#D9FF00] via-white to-[#00FFFF] drop-shadow-[0_0_30px_rgba(217,255,0,0.3)]">Collection<span className="text-white">.</span></span>
                  <div className="hidden md:block w-40 h-[2px] bg-gradient-to-r from-[#D9FF00] to-transparent opacity-20" />
                </div>
              </h2>
            </div>

            <CategoryExplorer
              productsByFilter={productsByFilter}
              categories={activeCategories}
            />
          </div>
        </section>

        {/* SECTION 3: COMMUNITY REVIEWS */}
        <section className="py-40 border-y border-white/5 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">

            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-[#D9FF00]" />
                <span className="text-[10px] font-mono font-black text-[#D9FF00] tracking-[0.5em] uppercase">Community_Voice</span>
                <div className="w-12 h-[1px] bg-[#D9FF00]" />
              </div>
              <h2 className="text-5xl md:text-[8vw] font-display font-black uppercase tracking-tighter leading-[0.75] italic max-w-4xl">
                What <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] to-[#00FFFF]">Curators</span> Say<span className="text-[#D9FF00]">.</span>
              </h2>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {/* Review 1 */}
              <div className="bento-card p-10 flex flex-col gap-8 bg-white/[0.01] group hover:bg-white/[0.03] transition-all duration-700">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-[#D9FF00] shadow-[0_0_10px_#D9FF00]" />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.4em]">Verified</span>
                </div>
                <p className="text-base font-aesthetic font-medium text-white/60 leading-relaxed italic">
                  "Finally found a place that gets it. No fake replicas, just pure authentic kits. The Barca retro I got is absolutely pristine."
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF0080] to-[#D9FF00] flex items-center justify-center">
                    <span className="text-sm font-display font-black text-black">AR</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-display font-black text-white uppercase tracking-wide">Arjun R.</span>
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Mumbai Curator</span>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bento-card p-10 flex flex-col gap-8 bg-white/[0.01] group hover:bg-white/[0.03] transition-all duration-700">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-[#D9FF00] shadow-[0_0_10px_#D9FF00]" />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.4em]">Verified</span>
                </div>
                <p className="text-base font-aesthetic font-medium text-white/60 leading-relaxed italic">
                  "Been collecting for 5+ years. 5AZ is the only Indian store I trust. Quality, packaging, authenticity—everything on point."
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00FFFF] flex items-center justify-center">
                    <span className="text-sm font-display font-black text-black">SK</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-display font-black text-white uppercase tracking-wide">Siddharth K.</span>
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Delhi Enthusiast</span>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bento-card p-10 flex flex-col gap-8 bg-white/[0.01] group hover:bg-white/[0.03] transition-all duration-700">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-[#D9FF00] shadow-[0_0_10px_#D9FF00]" />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.4em]">Verified</span>
                </div>
                <p className="text-base font-aesthetic font-medium text-white/60 leading-relaxed italic">
                  "The Argentina 2026 kit I ordered came faster than I expected. Material feels premium. 5AZ is the real deal for serious curators."
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF0080] to-[#0066FF] flex items-center justify-center">
                    <span className="text-sm font-display font-black text-white">VP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-display font-black text-white uppercase tracking-wide">Vikram P.</span>
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Bangalore Curator</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Stats Bar */}
            <div className="mt-32 flex flex-wrap justify-center gap-16 text-center">
              <div className="flex flex-col gap-3">
                <span className="text-6xl font-display font-black text-white">4.9</span>
                <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.4em]">Avg_Rating</span>
              </div>
              <div className="w-px h-20 bg-white/5" />
              <div className="flex flex-col gap-3">
                <span className="text-6xl font-display font-black text-white">200<span className="text-white/40">+</span></span>
                <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.4em]">Reviews</span>
              </div>
              <div className="w-px h-20 bg-white/5" />
              <div className="flex flex-col gap-3">
                <span className="text-6xl font-display font-black text-white">98<span className="text-white/40">%</span></span>
                <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.4em]">Satisfaction</span>
              </div>
            </div>

          </div>
        </section>


        {/* SECTION 4: GLOBAL SYNC (Aesthetic Home Section 4) */}
        <section className="py-40 relative overflow-hidden bg-black pb-60">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-black text-white/[0.02] tracking-tighter select-none pointer-events-none uppercase italic">
            UNITY
          </div>
          {/* Ambient Background Element - More Colourful */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#FF0080]/10 via-[#0066FF]/5 to-transparent blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,255,0,0.05)_0%,transparent_70%)]" />

          <div className="max-w-screen-2xl mx-auto px-6 md:px-12 text-center relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(217,255,0,0.1)] group">
              <Globe className="w-10 h-10 text-[#D9FF00] group-hover:text-[#0066FF] transition-colors duration-1000" />
            </div>
            <h3 className="text-4xl md:text-[6vw] font-display font-black uppercase mb-16 tracking-tighter leading-[0.8] max-w-5xl mx-auto italic">
              Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9FF00] via-[#FF0080] to-[#0066FF]">Curators,</span> For <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#00FFFF] to-[#D9FF00]">Curators.</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-12 text-[8px] font-mono font-black uppercase tracking-[0.5em] text-white/20 mb-20 italic">
              <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#D9FF00] shadow-[0_0_10px_#D9FF00]" /> High_Priority</span>
              <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#FF0080] shadow-[0_0_10px_#FF0080]" /> Verified_Auth</span>
              <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] shadow-[0_0_10px_#0066FF]" /> Global_Sync</span>
            </div>
            <Link href="/shop" className="group relative px-28 py-12 rounded-full bg-white text-black font-display font-black uppercase tracking-[0.4em] text-[12px] overflow-hidden transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl">
              <div className="absolute inset-0 bg-[#D9FF00] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              <span className="relative z-10">Initialize Catalog Search</span>
            </Link>
          </div>
        </section>

        {/* PREMIUM FOOTER - THE END OF THE JOURNEY */}
        <footer className="py-40 px-6 md:px-16 relative bg-[#000] border-t border-white/5 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-24 mb-32">
              <div className="flex flex-col gap-16">
                <Link href="/" className="group flex flex-col items-start gap-4">
                  <div className="flex items-center relative">
                    <span className="text-[10vw] font-display font-black italic tracking-tighter text-white transition-all duration-700 group-hover:text-white/90 leading-none z-10 relative">
                      5AZ
                    </span>
                    {/* Chromatic Aberration Effect */}
                    <span className="absolute top-0 left-0 text-[10vw] font-display font-black italic tracking-tighter text-[#FF0080] opacity-0 group-hover:opacity-70 group-hover:translate-x-[-4px] transition-all duration-300 blur-[2px] leading-none">5AZ</span>
                    <span className="absolute top-0 left-0 text-[10vw] font-display font-black italic tracking-tighter text-[#00FFFF] opacity-0 group-hover:opacity-70 group-hover:translate-x-[4px] transition-all duration-300 blur-[2px] leading-none">5AZ</span>

                    <div className="w-5 h-5 bg-[#D9FF00] rounded-full ml-6 shadow-[0_0_30px_#D9FF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4 opacity-40">
                    <span className="text-[8px] font-mono font-bold uppercase tracking-[0.5em] text-white">Archives_Hyperlink_Protocol</span>
                    <div className="w-12 h-[2px] bg-gradient-to-r from-[#D9FF00] to-transparent" />
                  </div>
                </Link>
                <div className="flex gap-10">
                  <div className="w-14 h-14 bg-white/[0.03] border border-white/5 flex items-center justify-center rounded-2xl text-white/40 hover:text-[#D9FF00] hover:border-[#D9FF00]/30 transition-all cursor-pointer">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div className="w-14 h-14 bg-white/[0.03] border border-white/5 flex items-center justify-center rounded-2xl text-white/40 hover:text-[#D9FF00] hover:border-[#D9FF00]/30 transition-all cursor-pointer">
                    <Twitter className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-left md:text-right">
                <div className="flex flex-col gap-6">
                  <h5 className="text-[8px] font-mono font-black uppercase tracking-[0.6em] text-[#D9FF00]/60">Archive_Indices</h5>
                  <ul className="flex flex-col gap-3 text-xs font-display font-black uppercase tracking-widest text-white/20">
                    <li><Link href="/shop" className="hover:text-white hover:text-glow-lime transition-all">Catalog</Link></li>
                    <li><Link href="/shop?category=Retro" className="hover:text-white transition-all">Retro_Vault</Link></li>
                    <li><Link href="/shop?category=New Drops" className="hover:text-white transition-all">Latest_Entry</Link></li>
                  </ul>
                </div>
                <div className="flex flex-col gap-6">
                  <h5 className="text-[8px] font-mono font-black uppercase tracking-[0.6em] text-[#FF0080]/60">Information</h5>
                  <ul className="flex flex-col gap-3 text-xs font-display font-black uppercase tracking-widest text-white/20">
                    <li><Link href="/terms" className="hover:text-white transition-all">Protocol</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-all">Privacy</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-all">Support</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex flex-col gap-2 opacity-20">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] italic text-center md:text-left">
                  © 2026 5AZ STUDIO // WORLDWIDE_VAULT_SYSTEM
                </span>
                <span className="text-[8px] font-mono font-medium uppercase tracking-[1em] text-center md:text-left">
                  Authorized by the Vanguard High Council
                </span>
              </div>
              <div className="flex items-center gap-10 glass-ultra px-8 py-3 rounded-full border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF0080] animate-pulse" />
                  <span className="text-[9px] font-mono font-black text-white/60 uppercase tracking-[0.5em]">Sync: Operational</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Region: IND_MUBS</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
