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
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

async function getCategoryData() {
  await dbConnect();

  const potentialCategories = [
    { name: "All", filter: "", query: {}, color: "text-white" },
    { name: "Drops", filter: "Season 25-26", query: { name: /Season 25-26/i }, color: "text-neon-blue" },
    { name: "Retro", filter: "Retro", query: { name: /Retro/i }, color: "text-neon-pink" },
    { name: "World", filter: "International", query: { $or: [{ category: /International/i }, { league: /International/i }] }, color: "text-neon-green" },
    { name: "English", filter: "Premier League", query: { league: /Premier League/i }, color: "text-neon-blue" },
    { name: "Spanish", filter: "La Liga", query: { league: /La Liga/i }, color: "text-neon-pink" },
    { name: "Training", filter: "Training", query: { name: /Training/i }, color: "text-neon-green" },
    { name: "Special", filter: "Special Edition", query: { name: /Special Edition/i }, color: "text-neon-blue" },
  ];

  const activeCategories = [];
  const productsByFilter: any = {};

  for (const cat of potentialCategories) {
    const products = await Product.find(cat.query).sort({ createdAt: -1 }).limit(10);
    if (products.length > 0) {
      activeCategories.push({ name: cat.name, filter: cat.filter, color: cat.color });
      productsByFilter[cat.filter] = JSON.parse(JSON.stringify(products));
    } else if (cat.name === "All") {
      // Always include All if we have anything
      activeCategories.push({ name: cat.name, filter: cat.filter, color: cat.color });
      productsByFilter[cat.filter] = JSON.parse(JSON.stringify(products));
    }
  }

  return { activeCategories, productsByFilter };
}

export default async function Home() {
  const { activeCategories, productsByFilter } = await getCategoryData();

  // All initial products for the explorer (from any category)
  const allInitial = productsByFilter[""] || [];

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSlider />

      <ScrollReveal>
        <Ticker />
      </ScrollReveal>

      {/* Branded Dynamic Category Row - Only shows active categories */}
      <CategoryExplorer
        initialProducts={allInitial}
        categories={activeCategories}
      />

      {/* Dynamic Thematic Sections based on available data */}
      {activeCategories.filter(cat => cat.filter !== "").slice(0, 5).map((cat, idx) => (
        <section key={cat.name} className={`py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-white/5 ${idx % 2 === 1 ? 'bg-white/5 rounded-[3rem] my-20' : ''}`}>
          <ScrollReveal>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className={`${cat.color} font-bold tracking-wider mb-2 uppercase`}>
                  {cat.name === 'Drops' ? 'NEW ERA' : cat.name === 'Retro' ? 'VINTAGE SOUL' : 'HERITAGE'}
                </h3>
                <div className="text-4xl md:text-5xl font-black italic">
                  <GlitchText text={cat.name.toUpperCase()} />
                </div>
              </div>
              <Link href={`/shop?category=${encodeURIComponent(cat.filter)}`} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest">
                View Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(productsByFilter[cat.filter] || []).slice(0, 4).map((product: any, pIdx: number) => (
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
          </ScrollReveal>
        </section>
      ))}

      <Testimonials />
      <Newsletter />

      <ScrollReveal>
        <Features />
      </ScrollReveal>
    </main>
  );
}
