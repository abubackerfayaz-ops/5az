import { Truck, ShieldCheck, Zap, Award } from "lucide-react";

export default function Features() {
    return (
        <section className="py-32 border-t border-white/5 bg-black relative overflow-hidden">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 bg-mesh-colorful opacity-20 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="p-10 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-neon-cyan/50 transition-colors duration-300 group">
                    <Truck className="w-10 h-10 mb-6 text-neon-cyan drop-shadow-[0_0_8px_#00ffff]" />
                    <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-4 text-white group-hover:text-neon-cyan transition-colors">Express Transit</h3>
                    <p className="text-neutral-400 font-mono font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                        Priority shipping on all domestic orders. Tracked and verified from vault to your door.
                    </p>
                </div>
                <div className="p-10 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-neon-pink/50 transition-colors duration-300 group md:-mt-8 md:mb-8">
                    <Award className="w-10 h-10 mb-6 text-neon-pink drop-shadow-[0_0_8px_#ff00ff]" />
                    <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-4 text-white group-hover:text-neon-pink transition-colors">AUTHENTIC ONLY</h3>
                    <p className="text-neutral-400 font-mono font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                        Every kit is hand-verified by our elite curators. No compromises on heritage.
                    </p>
                </div>
                <div className="p-10 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-neon-lime/50 transition-colors duration-300 group">
                    <Zap className="w-10 h-10 mb-6 text-neon-lime drop-shadow-[0_0_8px_#ccff00]" />
                    <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-4 text-white group-hover:text-neon-lime transition-colors">Priority Access</h3>
                    <p className="text-neutral-400 font-mono font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                        Join the Inner Circle for early entry to limited release drops and archive vaults.
                    </p>
                </div>
            </div>
        </section>
    );
}
