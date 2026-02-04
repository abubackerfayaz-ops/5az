'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from 'next-auth/react';

const navLinks = [
    { name: "ALL", href: "/shop" },
    { name: "NATIONS", href: "/shop?category=NATIONS" },
    { name: "CLUBS", href: "/shop?category=CLUBS" },
    { name: "RETRO", href: "/shop?category=RETRO" },
    { name: "SPECIALS", href: "/shop?category=SPECIALS" },
    { name: "NEW_KITS", href: "/shop?category=NEW_KITS" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { cartCount } = useCart();
    const { data: session } = useSession();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close search on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const userRole = (session?.user as any)?.role;
    const profileLink = userRole === 'admin' ? '/admin' : '/shop';
    const profileLabel = userRole === 'admin' ? 'ADMIN' : (session ? 'ACCOUNT' : 'LOGIN');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchOpen(false);
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-8'} px-6 md:px-16 border-b border-white/5`}>
                <div className={`max-w-screen-2xl mx-auto flex items-center justify-between`}>

                    {/* 5AZ Branded Logo - Matched to Image */}
                    <Link href="/" className="group flex items-center gap-2 py-1">
                        <div className="relative flex items-center">
                            <span className="text-4xl font-display font-black italic tracking-tighter text-white transition-all duration-700 group-hover:text-white/90 group-hover:scale-110 z-10 relative">
                                5AZ
                            </span>
                            {/* Chromatic Aberration Effect */}
                            <span className="absolute top-0 left-0 text-4xl font-display font-black italic tracking-tighter text-[#FF0080] opacity-0 group-hover:opacity-70 group-hover:translate-x-[-2px] group-hover:scale-110 transition-all duration-300 blur-[1px]">5AZ</span>
                            <span className="absolute top-0 left-0 text-4xl font-display font-black italic tracking-tighter text-[#00FFFF] opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] group-hover:scale-110 transition-all duration-300 blur-[1px]">5AZ</span>

                            <div className="w-1.5 h-1.5 bg-[#D9FF00] rounded-full ml-1.5 shadow-[0_0_15px_#D9FF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>

                    {/* Cyber Nav */}
                    <nav className="hidden lg:flex items-center gap-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-[10px] font-modern font-black uppercase tracking-[0.2em] transition-all duration-500 text-white/40 hover:text-white hover:tracking-[0.4em] relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#D9FF00] via-[#FF0080] to-[#00FFFF] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </Link>
                        ))}
                    </nav>

                    {/* Icons Hub */}
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8 border-r border-white/10 pr-8">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="group hover:scale-110 transition-transform"
                            >
                                <Search className="w-4 h-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
                            </button>

                            <div className="flex items-center gap-4">
                                <Link href={session ? profileLink : "/login"} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border ${session ? 'border-[#D9FF00] bg-[#D9FF00]/10 text-[#D9FF00]' : 'border-white/10'} group-hover:border-[#D9FF00]/40 flex items-center justify-center transition-all`}>
                                        {session ? <User className="w-3 h-3" /> : (
                                            <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-[#D9FF00]" />
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-display font-black uppercase tracking-[0.15em] ${session ? 'text-white' : ''}`}>{profileLabel}</span>
                                </Link>

                                {session && (
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="text-[9px] font-mono font-bold text-red-500/50 hover:text-red-500 hover:underline uppercase tracking-wider ml-2"
                                    >
                                        LOGOUT
                                    </button>
                                )}
                            </div>
                        </div>

                        <Link href="/checkout" className="group relative">
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-display font-black uppercase tracking-[0.15em] text-white/30 group-hover:text-white transition-colors">BAG</span>
                                <div className="relative">
                                    <ShoppingBag className="w-4 h-4 text-white group-hover:text-[#D9FF00] transition-colors" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br from-[#D9FF00] to-[#0066FF] text-black text-[7px] font-display font-black rounded-full flex items-center justify-center border border-black shadow-lg">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>

                        {/* Mobile Menu */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-white"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 bg-black z-[-1] flex flex-col items-center justify-center p-12 lg:hidden"
                        >
                            <div className="flex flex-col gap-10 text-center">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-4xl font-display font-black tracking-tight uppercase text-white italic"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <Link
                                    href={session ? profileLink : "/login"}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-4xl font-display font-black tracking-tight uppercase italic ${userRole === 'admin' ? 'text-[#FF0080]' : 'text-[#D9FF00]'}`}
                                >
                                    {profileLabel}
                                </Link>

                                {session && (
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                                        className="text-xs font-mono font-bold text-red-500 uppercase tracking-[0.2em] mt-8"
                                    >
                                        [ TERMINATE_SESSION ]
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="w-full max-w-4xl">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="w-12 h-[1px] bg-[#D9FF00]" />
                                <span className="text-[10px] font-mono font-black text-[#D9FF00] tracking-[0.5em] uppercase">Global_Search_Protocol</span>
                                <div className="w-12 h-[1px] bg-[#D9FF00]" />
                            </div>

                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH ARCHIVE..."
                                    className="w-full bg-transparent border-b-2 border-white/20 text-4xl md:text-6xl font-display font-black italic uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-[#D9FF00] py-8 px-4 text-center transition-colors"
                                    autoFocus
                                />
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D9FF00] via-[#FF0080] to-[#00FFFF] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700" />
                            </form>

                            <p className="text-center mt-8 text-white/40 font-mono text-xs tracking-widest uppercase">
                                Press <span className="text-white bg-white/10 px-2 py-1 rounded">Enter</span> to search
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
