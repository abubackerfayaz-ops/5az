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

async function getProductsByCategory(category: string) {
  try {
    await dbConnect();
    return await Product.find({ category: { $regex: new RegExp(category, "i") } }).sort({ createdAt: -1 }).limit(4);
  } catch (error) {
    console.error(`Failed to fetch ${category} products:`, error);
    return [];
  }
}

export default async function Home() {
  const seasonKits = await getProductsByCategory("Season 25-26");
  const retroKits = await getProductsByCategory("Retro");
  const internationalKits = await getProductsByCategory("International");

  const sections = [
    { title: "NEW ERA", subtitle: "SEASON 25/26", products: seasonKits, href: "/shop?category=Season+25-26", color: "text-neon-blue" },
    { title: "VINTAGE", subtitle: "RETRO CLASSICS", products: retroKits, href: "/shop?category=Retro", color: "text-neon-pink" },
    { title: "NATIONS", subtitle: "WORLD STAGE", products: internationalKits, href: "/shop?category=International", color: "text-neon-green" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSlider />

      <ScrollReveal>
        <Ticker />
      </ScrollReveal>

      {sections.map((section, idx) => (
        <section key={section.title} className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 last:border-0">
          <ScrollReveal>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className={`${section.color} font-bold tracking-wider mb-2 uppercase`}>{section.subtitle}</h3>
                <div className="text-4xl md:text-5xl font-black italic">
                  <GlitchText text={section.title} />
                </div>
              </div>
              <Link href={section.href} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest">
                Explore All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {section.products.map((product, pIdx) => (
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
            {section.products.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 italic">
                Scanning the archives... check back soon for fresh drops!
              </div>
            )}
          </div>
        </section>
      ))}

      <ScrollReveal>
        <Features />
      </ScrollReveal>
    </main>
  );
}
