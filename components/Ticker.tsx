'use client';

import { motion } from 'framer-motion';

const tickerItems = [
    "ELITE FOOTBALL CULTURE",
    "•",
    "PREMIUM AUTHENTIC KITS",
    "•",
    "RETRO ARCHIVE DROP",
    "•",
    "NATIONWIDE SHIPPING",
    "•",
    "CURATED EXCELLENCE",
    "•",
    "JOIN THE LEGACY",
    "•"
];

export default function Ticker() {
    return (
        <div className="overflow-hidden whitespace-nowrap">
            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="flex items-center gap-10 py-2"
            >
                {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
                    <span
                        key={idx}
                        className={`text-[10px] font-modern font-black uppercase tracking-[0.4em] ${item === '•'
                            ? 'text-[#D9FF00] shadow-[0_0_10px_rgba(217,255,0,0.5)]'
                            : idx % 4 === 0 ? 'text-[#FF0080]' : idx % 3 === 0 ? 'text-[#00FFFF]' : 'text-white/20'
                            }`}
                    >
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
