import { Truck, ShieldCheck, Zap } from "lucide-react";

export default function Features() {
    return (
        <section className="py-20 border-t border-white/10 bg-black">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-neon-blue transition-colors group">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-neon-blue group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black italic mb-2">FAST DELIVERY</h3>
                    <p className="text-gray-400">Get your kit before the next match day. Worldwide shipping available.</p>
                </div>
                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-neon-pink transition-colors group">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-neon-pink group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black italic mb-2">PREMIUM QUALITY</h3>
                    <p className="text-gray-400">Authentic materials and standard fit. Built for the pitch and the streets.</p>
                </div>
                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-neon-green transition-colors group">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-neon-green group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black italic mb-2">EXCLUSIVE DROPS</h3>
                    <p className="text-gray-400">Limited edition kits and retro classics you won&apos;t find anywhere else.</p>
                </div>
            </div>
        </section>
    );
}
