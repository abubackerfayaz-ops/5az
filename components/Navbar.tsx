'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, User, Search } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import GlitchText from "@/components/GlitchText";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { cartCount } = useCart();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: 'Drops', href: '/shop?category=Season+25-26', color: 'text-neon-green' },
        { name: 'Retro', href: '/shop?category=Retro' },
        { name: 'Heat', href: '/shop?category=Trending', color: 'text-neon-pink' },
        { name: 'Archive', href: '/shop?category=Archive' },
    ];

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-black/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - More prominent */}

                    <div className="flex-shrink-0">
                        <Link href="/" className="text-3xl font-black italic tracking-tighter text-white hover:text-white transition-all transform hover:scale-105 inline-block">
                            <GlitchText text="5AZ" />
                        </Link>
                    </div>

                    {/* Desktop Menu - Centered & Filed */}
                    <div className="hidden md:flex flex-1 justify-center items-center">
                        <div className="flex items-baseline space-x-12">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative group font-black italic uppercase tracking-widest text-sm transition-all duration-300 ${link.color ? link.color : 'text-gray-400 hover:text-white'}`}
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-neon-blue transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button className="text-gray-400 hover:text-neon-blue transition-colors transform hover:scale-110">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link href="/login" className="text-gray-400 hover:text-neon-pink transition-colors transform hover:scale-110">
                            <User className="w-5 h-5" />
                        </Link>
                        <Link href="/checkout" className="relative text-gray-400 hover:text-neon-green transition-colors transform hover:scale-110">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-3 -right-3 bg-neon-blue text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-none skew-x-[-10deg]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 border-b border-white/10 backdrop-blur-xl"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-3 py-3 rounded-md text-base font-black italic uppercase text-gray-300 hover:text-white hover:bg-white/5 tracking-wider"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-4" />
                            <Link href="/login" className="block px-3 py-3 rounded-md text-base font-black italic uppercase text-gray-300 hover:text-neon-pink">Account</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
}
