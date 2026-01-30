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
                setError("Invalid credentials or role.");
                return;
            }

            // Redirect based on role (though next-auth handles session, we route manually for UX)
            if (role === 'admin') router.push('/admin');
            else router.push('/shop');
        } else {
            // Registration logic (simplified for now, ideally calls an API)
            // For now, we only support Login as per request or simple registration
            setError("Registration is currently disabled. Please login.");
        }
    };

    return (
        <main className="min-h-screen bg-black bg-[url('https://images.unsplash.com/photo-1552318415-cc98975bcba0?q=80&w=1920&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <Navbar />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md bg-black/50 border border-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-black italic text-center mb-2 uppercase" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        {isLogin ? 'Welcome Back' : 'Join the Squad'}
                    </h2>
                    <p className="text-gray-400 text-center mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {isLogin ? 'Login to manage your orders.' : 'Sign up to get exclusive drops.'}
                    </p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-center text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div className="flex bg-white/5 p-1 rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => setRole('customer')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-bold ${role === 'customer' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                <User className="w-4 h-4" /> Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-bold ${role === 'admin' ? 'bg-neon-pink text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Shield className="w-4 h-4" /> Admin
                            </button>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold mb-1 ml-1 text-gray-300">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                                    placeholder="e.g. striker99"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1 text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1 text-gray-300">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="w-full bg-white text-black font-black uppercase py-4 rounded-lg hover:bg-neon-blue hover:text-white transition-all flex items-center justify-center gap-2 mt-4">
                            {isLogin ? 'Login' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-neon-blue font-bold hover:underline">
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
