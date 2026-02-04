'use client';


import Navbar from "@/components/Navbar";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<'customer' | 'admin'>('customer');
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isLogin) {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error || "Invalid credentials. Please try again.");
                return;
            }

            if (res?.ok) {
                // Successful login - redirect to shop page
                router.push('/shop');
                router.refresh();
            }
        } else {
            // Registration logic (simplified for now, ideally calls an API)
            setError("Registration is currently disabled. Please contact admin.");
        }
    };

    return (
        <main className="min-h-screen bg-[#030303] text-white selection:bg-[#FF0080] relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 cyber-grid opacity-5" />

                {/* Floating Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF0080]/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#00FFFF]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <Navbar />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-32">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D9FF00] to-transparent" />
                            <span className="text-[10px] font-mono font-black text-[#D9FF00] tracking-[0.5em] uppercase">Access_Portal</span>
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D9FF00] to-transparent" />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-display font-black italic tracking-tighter uppercase mb-4">
                            <span className="chrome-text">{isLogin ? 'Welcome' : 'Join'}</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] to-[#00FFFF]">
                                {isLogin ? 'Back' : 'The Vault'}
                            </span>
                        </h2>
                        <p className="text-sm font-aesthetic font-medium text-white/40 tracking-wide italic">
                            {isLogin ? 'Access your curated collection' : 'Become part of the culture'}
                        </p>
                    </div>

                    {/* Login Form Card */}
                    <div className="bento-card p-10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0080]/5 via-transparent to-[#00FFFF]/5 opacity-50" />

                        {error && (
                            <div className="bg-[#FF0080]/10 border border-[#FF0080]/30 text-[#FF0080] p-4 rounded-xl mb-6 text-center backdrop-blur-sm relative z-10">
                                <p className="text-xs font-mono font-bold uppercase tracking-wider">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            {!isLogin && (
                                <div>
                                    <label className="block text-[10px] font-mono font-black mb-3 ml-1 text-white/60 uppercase tracking-widest">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-aesthetic focus:border-[#D9FF00]/40 focus:outline-none transition-all placeholder:text-white/20"
                                        placeholder="striker_99"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-mono font-black mb-3 ml-1 text-white/60 uppercase tracking-widest">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-aesthetic focus:border-[#D9FF00]/40 focus:outline-none transition-all placeholder:text-white/20"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono font-black mb-3 ml-1 text-white/60 uppercase tracking-widest">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-aesthetic focus:border-[#D9FF00]/40 focus:outline-none transition-all placeholder:text-white/20"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full group relative px-10 py-5 rounded-full bg-white text-black font-display font-black uppercase tracking-[0.3em] text-[11px] overflow-hidden transition-all duration-700 hover:scale-105 shadow-2xl mt-8"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D9FF00] to-[#00FFFF] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isLogin ? 'Access Vault' : 'Initialize Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center relative z-10">
                            <p className="text-xs text-white/40 font-mono">
                                {isLogin ? "New curator? " : "Already registered? "}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-[#D9FF00] font-bold hover:underline uppercase tracking-wider">
                                    {isLogin ? 'Sign Up' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Info Tag */}
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 glass-ultra px-6 py-3 rounded-full border border-white/5">
                            <Shield className="w-4 h-4 text-[#00FFFF]" />
                            <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-[0.4em]">Secured_Protocol</span>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
