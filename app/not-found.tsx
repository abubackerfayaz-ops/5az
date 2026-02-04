import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 p-12 max-w-2xl">
                <h1 className="text-6xl md:text-9xl font-display font-black italic tracking-tighter mb-4 text-neutral-800/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">404</h1>
                <h2 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">KIT MISSING.</h2>
                <p className="text-neutral-400 text-lg mb-10 font-mono font-bold uppercase tracking-widest text-sm">
                    The requested archive has been transferred or never signed.
                </p>

                <Link
                    href="/"
                    className="group relative inline-flex px-14 py-5 bg-white text-black font-display font-black uppercase text-xs tracking-[0.2em] rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                    <span className="relative z-10">RETURN TO PITCH</span>
                    <div className="absolute inset-0 bg-lime-400 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
                </Link>
            </div>
        </div>
    );
}
