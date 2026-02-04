'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('🔥 Frontend Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="mesh-gradient opacity-50"></div>
            </div>

            <div className="relative z-10 glass-morphism p-12 max-w-2xl border border-white/10 rounded-3xl">
                <h2 className="text-4xl md:text-6xl font-display text-glow-pink mb-6">GLITCH IN <br /> THE MATRIX</h2>
                <p className="text-gray-400 text-lg mb-8 font-outfit">
                    Something unexpected happened while loading the culture.
                    {error.message && <span className="block mt-2 text-sm text-red-400 font-mono">Error: {error.message}</span>}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-8 py-3 bg-white text-black font-bebas text-xl rounded-full hover:bg-neon-pink hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                        TRY AGAIN
                    </button>

                    <Link
                        href="/"
                        className="px-8 py-3 border border-white/20 text-white font-bebas text-xl rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                    >
                        RETURN HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}
