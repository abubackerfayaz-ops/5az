'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
}

export default function ProductCard({ id, name, price, originalPrice, image, category }: ProductCardProps) {
    return (
        <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-500 hover:-translate-y-2">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-black/20">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />

                {/* Badge with properties */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-neon-blue/30 text-neon-blue text-[10px] font-black px-3 py-1 uppercase tracking-wider rounded-full">
                    {category}
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 to-transparent">
                    <button className="w-full bg-white text-black font-black uppercase py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-neon-green hover:shadow-lg hover:shadow-neon-green/20 transition-all transform active:scale-95">
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-neon-pink hover:border-neon-pink hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Info Section */}
            <div className="p-5">
                <div className="h-0.5 w-10 bg-white/10 mb-4 group-hover:w-full group-hover:bg-neon-blue transition-all duration-500"></div>
                <h3 className="text-lg font-bold truncate text-white group-hover:text-neon-blue transition-colors mb-2 font-display">
                    <Link href={`/product/${id}`}>
                        {name}
                    </Link>
                </h3>
                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Price</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black italic text-white">₹{price}</span>
                            {originalPrice && (
                                <span className="text-sm text-white/40 line-through decoration-neon-pink">₹{originalPrice}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-bl-3xl"></div>
        </div>
    );
}
