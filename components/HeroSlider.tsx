'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

export default function HeroSlider() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    if (!isMounted) return <div className="h-screen bg-[#030303]" />;

    return (
        <section ref={containerRef} className="relative w-full h-[110vh] bg-[#000000] overflow-hidden flex items-center justify-center pt-24">
            {/* Extremely Vibrant Gen Z Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#D9FF00]/15 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#FF0080]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#00FFFF]/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-16 flex flex-col items-start">

                {/* Cyber Badges */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 mb-12"
                >
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-[#D9FF00]/20 bg-[#D9FF00]/5 backdrop-blur-xl">
                        <div className="w-2 h-2 rounded-full bg-[#D9FF00] shadow-[0_0_15px_#D9FF00]" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#D9FF00]">Vault_Active</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-[#FF0080]/20 bg-[#FF0080]/5 backdrop-blur-xl">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#FF0080]">Authentic</span>
                    </div>
                </motion.div>

                {/* Hyper-Modern Typography */}
                <motion.div
                    style={{ opacity }}
                    className="mb-20 group"
                >
                    <h1 className="font-display font-black leading-[0.75] tracking-[-0.06em] uppercase text-white flex flex-col items-start gap-4">
                        <span className="text-[14vw] md:text-[4vw] font-accent italic font-black text-white/10 tracking-[0.3em] -mb-[2vw]">HEIRLOOM_GEAR</span>
                        <span className="text-[12vw] md:text-[9vw] block group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D9FF00] group-hover:to-[#00FFFF] transition-all duration-700">SYSTEM_SYNC</span>
                        <span className="text-[8vw] md:text-[6vw] block translate-x-[0.04em] text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] via-white to-[#00FFFF] drop-shadow-[0_0_30px_rgba(255,0,128,0.3)]">Archive_Vault<span className="text-white">.</span></span>
                    </h1>
                </motion.div>

                <div className="flex flex-col md:flex-row items-end justify-between w-full gap-20">
                    <div className="flex flex-col gap-10 max-w-xl">
                        <Link href="/shop" className="group relative inline-block">
                            <div className="absolute -inset-2 bg-gradient-to-r from-[#D9FF00] via-[#FF0080] to-[#00FFFF] rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse" />
                            <div className="relative px-14 py-7 rounded-full bg-white text-black font-modern font-black uppercase tracking-[0.3em] text-[11px] flex items-center gap-10 transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                                EXPLORE VAULT
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                            </div>
                        </Link>

                        <div className="flex items-start gap-6">
                            <div className="w-[2px] h-12 bg-gradient-to-b from-[#D9FF00] via-[#FF0080] to-transparent" />
                            <p className="text-[13px] font-aesthetic font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-sm italic">
                                India's premier community platform for <span className="text-white not-italic">elite football kits</span>, curated for the <span className="text-[#00FFFF] not-italic">next_gen</span> of collectors.
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Stats Element */}
                    <div className="flex flex-col items-end gap-1 text-right border-r-2 border-[#D9FF00] pr-8 py-2">
                        <span className="text-[10px] font-mono font-bold text-[#D9FF00]/60 uppercase tracking-[0.5em] mb-3 uppercase">Status: Online</span>
                    </div>
                </div>
            </div>

            {/* Aesthetic Navigation Dot */}
            <div className="absolute bottom-16 right-16 flex flex-col gap-5 items-end group">
                <div className="flex gap-4">
                    <div className="w-20 h-[2px] bg-gradient-to-r from-[#D9FF00] to-transparent" />
                    <div className="w-8 h-[2px] bg-white/10" />
                    <div className="w-8 h-[2px] bg-white/10" />
                </div>
            </div>
        </section>
    );
}
