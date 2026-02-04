'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { LayoutGrid, SlidersHorizontal, Zap, Database } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    variants: Array<{
        price: { amount: number; originalAmount?: number };
        images: Array<{ url: string }>;
    }>;
    category?: string;
    brand?: string;
}

export default function CategoryExplorer({
    productsByFilter,
    categories
}: {
    productsByFilter: Record<string, Product[]>,
    categories: { name: string, filter: string, color: string }[]
}) {
    const [activeFilter, setActiveFilter] = useState(categories[0].filter);

    const displayedProducts = productsByFilter[activeFilter] || [];

    return (
        <section className="relative z-20">
            <div className="flex flex-col gap-16 mb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 bg-black py-4 px-8 rounded-full border border-white/5">
                    {/* Category Selection - Minimal Capsules */}
                    <div className="flex flex-wrap gap-12 items-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveFilter(cat.filter)}
                                className={`relative px-8 py-3 rounded-full text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group ${activeFilter === cat.filter
                                    ? 'text-black'
                                    : 'text-white/30 hover:text-white'
                                    }`}
                            >
                                {activeFilter === cat.filter && (
                                    <motion.div
                                        layoutId="activeTabBase"
                                        className="absolute inset-0 bg-gradient-to-r from-[#D9FF00] via-white to-[#00FFFF]"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24 md:gap-x-16 md:gap-y-32">
                <AnimatePresence mode='wait'>
                    {displayedProducts.length > 0 ? (
                        displayedProducts.map((product, idx) => (
                            <motion.div
                                key={`${activeFilter}-${product._id}`}
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{
                                    duration: 0.8,
                                    delay: idx * 0.05,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                            >
                                <ProductCard
                                    id={product._id}
                                    name={product.name}
                                    price={product.variants[0]?.price?.amount || 0}
                                    originalPrice={product.variants[0]?.price?.originalAmount}
                                    image={product.variants[0]?.images[0]?.url}
                                    category={product.category || activeFilter || "Official"}
                                    brand={product.brand}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-60 text-center rounded-[4rem] border border-dashed border-white/5 bg-white/[0.02]"
                        >
                            <div className="text-5xl md:text-8xl font-display font-black italic text-white/[0.03] uppercase tracking-tighter mb-8">ARCHIVE_EMPTY</div>
                            <p className="text-[#D9FF00] font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse opacity-50">Synchronizing with high-priority vaults...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
