'use client';

import Link from 'next/link';
import { ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category: string;
    brand?: string;
}

export default function ProductCard({ id, name, price, originalPrice, image, category, brand }: ProductCardProps) {
    const displayImage = image || "https://placehold.co/500x700";

    return (
        <div className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 transition-all duration-700 hover:border-[#D9FF00]/30 hover:shadow-[0_0_50px_-15px_rgba(217,255,0,0.15)]">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a]">
                <img
                    src={displayImage}
                    alt={name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-[1s] group-hover:scale-110 grayscale-[0.1] group-hover:grayscale-0"
                />

                {/* Cyber Badge */}
                <div className="absolute top-4 left-4">
                    <span className="bg-black/90 backdrop-blur-xl text-[8px] font-mono font-bold text-[#D9FF00] px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#D9FF00]/20 shadow-[0_0_20px_rgba(217,255,0,0.1)]">
                        {category}
                    </span>
                </div>

                {/* Hyper Add Button Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]">
                    <button className="w-full h-14 bg-gradient-to-r from-[#D9FF00] via-white to-[#00FFFF] text-black font-display font-black text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-4 hover:scale-105 transition-all active:scale-95 shadow-2xl">
                        ADD TO BAG <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 pb-10 flex flex-col gap-5 bg-gradient-to-b from-transparent to-[#D9FF00]/5">
                <div className="flex flex-col gap-2">
                    {brand && (
                        <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.3em]">
                            {brand}
                        </span>
                    )}
                    <Link href={`/product/${id}`}>
                        <h3 className="text-lg font-display font-black uppercase text-white tracking-tight leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-[#D9FF00] group-hover:to-[#00FFFF] transition-all duration-500">
                            {name}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display font-black text-white italic tracking-tighter">
                            ₹{price.toLocaleString()}
                        </span>
                        {originalPrice && (
                            <span className="text-[10px] font-mono text-[#FF0080]/60 line-through tracking-widest">
                                ₹{originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-white/20 uppercase tracking-[0.4em] border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00FFFF] shadow-[0_0_10px_#00FFFF] animate-pulse" />
                        <span>Ready_Ship</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                        <span className="text-white/10 group-hover:text-[#D9FF00]/50 transition-colors">Archived</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
