'use client';

import { useState } from 'react';
import { Minus, Plus, Heart, Check, ShoppingBag, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductActionsProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    sizes: string[];
    inStock: boolean;
}

export default function ProductActions({ id, name, price, image, sizes, inStock, originalPrice }: ProductActionsProps) {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const validSizes = (sizes && sizes.length > 0 && sizes[0] !== "")
        ? sizes
        : ['S', 'M', 'L', 'XL', 'XXL'];

    const handleAddToCart = () => {
        if (!selectedSize) return;
        addToCart({ id, name, price, image, size: selectedSize, quantity });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex flex-col gap-12">
            {/* Pricing Buffer */}
            <div className="flex items-end gap-6 border-b border-white/5 pb-10">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-black text-[#FF0080] uppercase tracking-[0.5em]">VALUATION_BUFFER</span>
                    <span className="text-5xl font-display font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        ₹{price.toLocaleString()}
                    </span>
                </div>
                {originalPrice && (
                    <span className="text-xl font-mono text-white/20 line-through tracking-widest mb-1 decoration-1">
                        ₹{originalPrice.toLocaleString()}
                    </span>
                )}
            </div>

            {/* Size Selector - High Aesthetic */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-display font-black uppercase tracking-[0.4em] text-white">Select_Size</span>
                    <button className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest hover:text-[#FF0080] transition-colors">Digital_Size_Intel</button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {validSizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-16 h-16 flex items-center justify-center rounded-2xl font-display font-black transition-all duration-500 border ${selectedSize === size
                                ? 'bg-[#FF0080] border-[#FF0080] text-white shadow-[0_0_30px_rgba(255,0,128,0.3)]'
                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity Protocol */}
            <div className="space-y-6">
                <span className="text-[11px] font-display font-black uppercase tracking-[0.4em] text-white">Unit_Quantity</span>
                <div className="inline-flex items-center glass-ultra rounded-2xl p-2 border border-white/5">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-display font-black text-white tracking-widest">{quantity.toString().padStart(2, '0')}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col gap-6">
                <button
                    onClick={handleAddToCart}
                    disabled={added || !inStock || !selectedSize}
                    className={`relative w-full py-8 rounded-full font-display font-black uppercase tracking-[0.4em] text-[13px] overflow-hidden transition-all duration-700 shadow-2xl flex items-center justify-center gap-6 ${added
                        ? 'bg-green-500 text-black'
                        : !selectedSize ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    {!added && selectedSize && (
                        <div className="absolute inset-0 bg-[#FF0080] translate-y-full hover:translate-y-0 transition-transform duration-700" />
                    )}
                    <span className="relative z-10 flex items-center gap-6">
                        {added ? (
                            <>SYNC_COMPLETE <Check className="w-5 h-5" /></>
                        ) : !selectedSize ? (
                            'AWAITING_SIZE_LOCK'
                        ) : (
                            <>SECURE_ASSET <ShoppingBag className="w-5 h-5" /></>
                        )}
                    </span>
                </button>

                <div className="grid grid-cols-2 gap-6">
                    <button className="py-6 rounded-full glass-ultra font-display font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-4">
                        <Zap className="w-4 h-4 text-[#FF0080]" /> Express_Out
                    </button>
                    <button className="py-6 rounded-full glass-ultra font-display font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-4">
                        <Heart className="w-4 h-4 text-white/40" /> Archive_It
                    </button>
                </div>
            </div>

            {/* Status Feedback */}
            <div className="flex items-center gap-6 p-6 glass-ultra rounded-3xl border border-white/5">
                <div className={`w-3 h-3 rounded-full ${inStock ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-red-500'} animate-pulse`} />
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest leading-none">
                        {inStock ? 'REPOSITORY_READY' : 'UNIT_UNAVAILABLE'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest">
                        {inStock ? 'VERIFIED_STOCK_INDEX_ACTIVE' : 'AWAITING_REPLENISHMENT'}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-4 opacity-20">
                    <ShieldCheck className="w-6 h-6" />
                    <div className="w-px h-8 bg-white" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">GENUINE_ONLY</span>
                </div>
            </div>
        </div>
    );
}
