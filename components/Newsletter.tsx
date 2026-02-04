'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Mail } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="py-40 px-6">
            <div className="max-w-7xl mx-auto bg-neutral-900/50 backdrop-blur-2xl p-12 md:p-24 rounded-[4rem] relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Decorative Accents - Subtle */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-neon-purple/20 opacity-30 skew-x-12 translate-x-1/2 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-neon-cyan/20 opacity-30 -skew-x-12 -translate-x-1/2 blur-[100px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-neon-cyan font-sans font-black tracking-[0.4em] text-[10px] uppercase mb-6 block drop-shadow-[0_0_5px_#00ffff]">The Inner Circle</span>
                            <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase mb-8 tracking-tighter leading-none text-white">
                                ACCESS THE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">HERITAGE.</span>
                            </h2>
                            <p className="text-neutral-400 font-sans font-bold uppercase tracking-widest text-xs max-w-md leading-relaxed">
                                Join our community for early access to limited edition drops, verified archive kits, and exclusive member events.
                            </p>
                        </motion.div>
                    </div>

                    <div className="relative z-10">
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-6 text-neon-lime py-8"
                                    >
                                        <CheckCircle className="w-16 h-16 drop-shadow-[0_0_10px_#ccff00]" />
                                        <span className="text-xl font-display font-black uppercase tracking-[0.2em] text-white">Welcome to the Club</span>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-neon-cyan transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="EMAIL ADDRESS"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 px-16 py-7 rounded-full focus:outline-none focus:border-neon-cyan/50 text-white font-mono font-bold tracking-widest placeholder:text-neutral-600 uppercase text-xs transition-all shadow-lg focus:shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                                            />
                                        </div>
                                        <button
                                            disabled={status === 'loading'}
                                            className="w-full bg-white text-black py-7 rounded-full font-mono font-black uppercase tracking-[0.3em] text-xs hover:bg-neon-lime hover:scale-[1.02] transition-all active:scale-[0.98] shadow-xl hover:shadow-[0_0_20px_#ccff00]"
                                        >
                                            {status === 'loading' ? 'Processing...' : 'Request Invitation'}
                                        </button>
                                        <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-widest text-center mt-4">
                                            Priority access • Verified only • Opt-out anytime
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}


