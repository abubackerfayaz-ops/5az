'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
}

export default function CategoryExplorer({
    initialProducts,
    categories
}: {
    initialProducts: Product[],
    categories: { name: string, filter: string, color: string }[]
}) {
    const [activeFilter, setActiveFilter] = useState(categories[0].filter);

    const filteredProducts = initialProducts
        .filter(p => !activeFilter || p.category.toLowerCase().includes(activeFilter.toLowerCase()))
        .slice(0, 4);

    return (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="bg-white text-black px-4 py-2 font-black italic text-2xl skew-x-[-10deg]">
                        5AZ
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveFilter(cat.filter)}
                                className={`px-4 py-1 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeFilter === cat.filter
                                    ? `${cat.color} border-current`
                                    : 'text-gray-500 border-transparent hover:text-white'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
                <Link
                    href={`/shop?category=${encodeURIComponent(activeFilter)}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest border border-white/10 px-6 py-2 rounded-full hover:bg-white/5"
                >
                    Explore {activeFilter || 'All'} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredProducts.map((product, idx) => (
                        <motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            <ProductCard
                                id={product._id}
                                name={product.name}
                                price={product.price}
                                originalPrice={product.originalPrice}
                                image={product.images[0]}
                                category={product.category}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500 italic">
                        No kits found in this category yet.
                    </div>
                )}
            </motion.div>
        </section>
    );
}
