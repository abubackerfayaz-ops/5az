'use client';

import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";
import AdminProductManager from "@/components/AdminProductManager";
import AdminFulfillment from "@/components/AdminFulfillment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session && (session as any).user.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">LOADING SECURITY CLEARANCE...</div>;
    }

    if (!session || (session as any).user.role !== 'admin') {
        return null; // Will redirect in useEffect
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-32">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic mb-2 text-neon-pink flex items-center gap-3">
                            <Shield className="w-10 h-10" /> ADMIN DASHBOARD
                        </h1>
                        <p className="text-gray-400 font-bold tracking-widest uppercase">Manage your empire</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-black italic">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm group hover:border-neon-pink transition-all">
                        <h3 className="text-gray-400 mb-2 tracking-widest text-xs uppercase">TOTAL ORDERS</h3>
                        <p className="text-4xl text-neon-pink group-hover:scale-110 transition-transform origin-left">0</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm group hover:border-neon-blue transition-all">
                        <h3 className="text-gray-400 mb-2 tracking-widest text-xs uppercase">REVENUE</h3>
                        <p className="text-4xl text-neon-blue group-hover:scale-110 transition-transform origin-left">₹0</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm group hover:border-neon-green transition-all">
                        <h3 className="text-gray-400 mb-2 tracking-widest text-xs uppercase">STOCK STATUS</h3>
                        <p className="text-4xl text-neon-green group-hover:scale-110 transition-transform origin-left">HEALTHY</p>
                    </div>
                </div>

                {/* Fulfillment Area */}
                <div className="mb-12">
                    <AdminFulfillment />
                </div>

                {/* Product Management Area */}
                <AdminProductManager />
            </div>
        </main>
    );
}

