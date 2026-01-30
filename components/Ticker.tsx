'use client';

import { motion } from 'framer-motion';

export default function Ticker() {
    return (
        <div className="bg-neon-green text-black py-3 overflow-hidden whitespace-nowrap border-y border-black">
            <motion.div
                className="inline-block text-xl font-black italic uppercase tracking-widest"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
                Start Your Legacy • Worldwide Shipping • Premium Jersey Collection • 5AZ Exclusive Drops • Unmatched Quality • Start Your Legacy • Worldwide Shipping • Premium Jersey Collection • 5AZ Exclusive Drops • Unmatched Quality •
            </motion.div>
        </div>
    );
}
