'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-blue/5 skew-y-3 translate-y-20 -z-10" />

            <div className="max-w-4xl mx-auto bg-black border border-white/10 p-8 md:p-16 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/10 blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px] -z-10" />

                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black italic uppercase mb-4 tracking-tighter"
                    >
                        JOIN THE <span className="text-neon-blue">INNER CIRCLE</span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg">
                        Get early access to drops, exclusive discounts, and restock alerts.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 text-neon-green py-4"
                            >
                                <CheckCircle className="w-12 h-12" />
                                <span className="font-black italic uppercase tracking-widest">You're in the elite squads!</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex flex-col md:flex-row gap-4"
                            >
                                <input
                                    type="email"
                                    required
                                    placeholder="your-email@legacy.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/20 px-6 py-4 rounded-2xl focus:outline-none focus:border-neon-blue transition-colors text-white font-bold italic"
                                />
                                <button
                                    disabled={status === 'loading'}
                                    className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all flex items-center justify-center gap-2 group"
                                >
                                    {status === 'loading' ? 'Linking...' : 'Subscribe'}
                                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <p className="text-center text-[10px] text-gray-600 mt-8 uppercase tracking-[0.2em]">
                    * NO SPAM. JUST PURE FOOTBALL CULTURE. UNSUBSCRIBE ANYTIME.
                </p>
            </div>
        </section>
    );
}

import { AnimatePresence } from 'framer-motion';
