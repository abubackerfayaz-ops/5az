import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="md:col-span-2">
                        <h2 className="text-4xl font-display font-black italic uppercase text-white mb-6">
                            5AZ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9FF00] to-[#FF0080]">ARCHIVE</span>
                        </h2>
                        <p className="text-white/60 font-mono text-sm max-w-sm">
                            Curating the finest football heritage. We act as an independent gateway to premium kits globally.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display font-black uppercase text-white mb-6">Support</h3>
                        <ul className="space-y-4 text-sm text-white/60 font-mono">
                            <li><Link href="/track" className="hover:text-[#D9FF00] transition-colors">Order Status</Link></li>
                            <li><Link href="/shipping" className="hover:text-[#D9FF00] transition-colors">Shipping Protocol</Link></li>
                            <li><Link href="/returns" className="hover:text-[#D9FF00] transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/faq" className="hover:text-[#D9FF00] transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-black uppercase text-white mb-6">The Lab</h3>
                        <ul className="space-y-4 text-sm text-white/60 font-mono">
                            <li><Link href="/about" className="hover:text-[#D9FF00] transition-colors">About 5AZ</Link></li>
                            <li><Link href="/authenticity" className="hover:text-[#D9FF00] transition-colors">Authenticity Promise</Link></li>
                            <li><Link href="/contact" className="hover:text-[#D9FF00] transition-colors">Contact Ops</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-mono text-white/40 max-w-2xl">
                        <p className="mb-2">⚠️ LEGAL DISCLAIMER: 5AZ is an independent reseller and is not directly affiliated with, endorsed by, or sponsored by any specific sports team, brand, or manufacturer unless explicitly stated. All trademarks and brand names are the property of their respective owners and used for identification purposes only.</p>
                        <p>We source products from verified third-party suppliers to ensure quality and authenticity. Product fulfillment may be handled by our global logistics partners.</p>
                    </div>

                    <div className="flex gap-6 text-white/40">
                        <ShieldCheck className="w-5 h-5" />
                        <Truck className="w-5 h-5" />
                        <RotateCcw className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
