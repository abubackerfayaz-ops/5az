'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Ticket } from 'lucide-react';
import Link from 'next/link';
import GlitchText from './GlitchText';

export default function HeroSlider() {
    return (
        <section className="relative w-full min-h-[90vh] bg-black flex flex-col items-center justify-center py-20 overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            <div className="relative w-full max-w-6xl px-4 flex flex-col gap-8 md:gap-0">

                {/* 1. FOOTBALL JERSEYS (Top Card - Centered) */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    className="relative w-full md:w-[85%] lg:w-[75%] h-[40vh] bg-neutral-900 rounded-3xl overflow-hidden self-center border border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: 'url("https://images.hdqwalls.com/download/lionel-messi-and-cristiano-ronaldo-louis-vuitton-5k-8a-3840x2160.jpg")' }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="bg-neon-blue text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-transparent group-hover:border-white transition-all">
                                Season 25/26
                            </div>
                            <Zap className="text-white w-8 h-8 opacity-50 group-hover:text-neon-blue group-hover:opacity-100 transition-all" />
                        </div>

                        <div>
                            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none mb-4 drop-shadow-xl">
                                <GlitchText text="FOOTBALL" />
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">JERSEYS</span>
                            </h1>
                            <Link href="/shop" className="inline-flex items-center gap-2 text-white border-b-2 border-neon-blue pb-1 font-bold uppercase tracking-wider hover:text-neon-blue transition-colors">
                                Shop Collection <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* 2. CLEARANCE (Bottom Card - Centered) */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                    whileHover={{ scale: 1.02, zIndex: 20 }}
                    className="relative w-full md:w-[85%] lg:w-[75%] h-[35vh] bg-red-900/20 rounded-3xl overflow-hidden self-center mt-4 border border-white/10 group backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-[center_top] opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626244422230-05047b973a5a?q=80&w=1920&fit=crop")' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-black/50" />

                    {/* "Sticker" Element */}
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black p-4 rounded-full rotate-12 font-black text-center leading-tight shadow-lg border-2 border-black transform group-hover:rotate-180 transition-transform duration-500">
                        60%<br />OFF
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <Ticket className="w-4 h-4" /> Limited Time
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black italic uppercase text-white tracking-tighter mb-4">
                            CLEARANCE
                        </h2>
                        <Link href="/shop?category=Clearance" className="w-fit bg-white text-black px-6 py-2 rounded-lg font-black uppercase text-sm hover:bg-red-500 hover:text-white transition-colors">
                            Grab Steals
                        </Link>
                    </div>
                </motion.div>

            </div>

            {/* Decorative Background Text (Very subtle) */}
            <div className="absolute bottom-0 left-0 whitespace-nowrap opacity-[0.03] select-none pointer-events-none">
                <span className="text-[20vw] font-black uppercase text-white">CULTURE</span>
            </div>
        </section>
    );
}
