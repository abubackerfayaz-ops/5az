'use client';

import { useState } from 'react';
import { Minus, Plus, Heart, Check } from 'lucide-react';
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

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size!');
            return;
        }

        addToCart({
            id,
            name,
            price,
            image,
            size: selectedSize,
            quantity,
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">₹{price}</span>
                {originalPrice && (
                    <span className="text-xl text-gray-500 line-through">₹{originalPrice}</span>
                )}
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="font-bold">Select Size</span>
                        <button className="text-gray-400 text-sm hover:text-white">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-12 h-12 flex items-center justify-center border transition-all font-bold ${selectedSize === size
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/20 hover:border-white hover:bg-white hover:text-black'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <span className="font-bold block mb-2">Quantity</span>
                    <div className="inline-flex items-center border border-white/20">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 hover:bg-white/10"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-3 hover:bg-white/10"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={added || !inStock}
                    className={`flex-1 font-black uppercase py-4 transition-all flex items-center justify-center gap-2 ${added
                        ? 'bg-green-500 text-black'
                        : 'bg-neon-blue text-black hover:bg-white'
                        }`}
                >
                    {added ? 'Added to Cart' : 'Add to Cart'}
                </button>
                <button className="flex-1 border border-white/20 text-white font-bold uppercase py-4 hover:bg-white hover:text-black transition-colors">
                    Buy Now
                </button>
                <button className="p-4 border border-white/20 hover:bg-pink-500 hover:border-pink-500 transition-colors">
                    <Heart className="w-5 h-5" />
                </button>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-green-400">
                {inStock ? (
                    <>
                        <Check className="w-4 h-4" /> In Stock - Ready to Ship
                    </>
                ) : (
                    <span className="text-red-500">Out of Stock</span>
                )}
            </div>
        </>
    );
}
