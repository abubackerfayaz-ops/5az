import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import Ticker from "@/components/Ticker";
import Features from "@/components/Features";
import GlitchText from "@/components/GlitchText";
import ScrollReveal from "@/components/ScrollReveal";

import CategoryExplorer from "@/components/CategoryExplorer";

async function getProductsByCategory(category: string, limit = 4) {
  try {
    await dbConnect();
    const query = category ? { category: { $regex: new RegExp(category, "i") } } : {};
    return await Product.find(query).sort({ createdAt: -1 }).limit(limit);
  } catch (error) {
    console.error(`Failed to fetch ${category} products:`, error);
    return [];
  }
}

export default async function Home() {
  // Products for the Category Explorer
  const allInitial = await getProductsByCategory("", 20);

  // Specific sections
  const seasonKits = await getProductsByCategory("Season 25-26");
  const retroKits = await getProductsByCategory("Retro");

  const categories = [
    { name: "All", filter: "", color: "text-white" },
    { name: "Drops", filter: "Season 25-26", color: "text-neon-blue" },
    { name: "Retro", filter: "Retro", color: "text-neon-pink" },
    { name: "International", filter: "International", color: "text-neon-green" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSlider />

      <ScrollReveal>
        <Ticker />
      </ScrollReveal>

      {/* Branded Category Row */}
      <CategoryExplorer initialProducts={JSON.parse(JSON.stringify(allInitial))} categories={categories} />

      {/* Thematic Sections */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-white/5">
        <ScrollReveal>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-neon-blue font-bold tracking-wider mb-2 uppercase">NEW ERA</h3>
              <div className="text-4xl md:text-5xl font-black italic">
                <GlitchText text="SEASON 25/26" />
              </div>
            </div>
            <Link href="/shop?category=Season+25-26" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest">
              View Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {seasonKits.map((product, pIdx) => (
            <ScrollReveal key={product._id.toString()} delay={pIdx * 0.1}>
              <ProductCard
                id={product._id.toString()}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.images[0]}
                category={product.category}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-white/5 bg-white/5 rounded-[3rem] my-20">
        <ScrollReveal>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-neon-pink font-bold tracking-wider mb-2 uppercase">VINTAGE SOUL</h3>
              <div className="text-4xl md:text-5xl font-black italic">
                <GlitchText text="RETRO CLASSICS" />
              </div>
            </div>
            <Link href="/shop?category=Retro" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest">
              View Archive <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {retroKits.map((product, pIdx) => (
            <ScrollReveal key={product._id.toString()} delay={pIdx * 0.1}>
              <ProductCard
                id={product._id.toString()}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.images[0]}
                category={product.category}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ScrollReveal>
        <Features />
      </ScrollReveal>
    </main>
  );
}
