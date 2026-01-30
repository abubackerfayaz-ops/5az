'use client';

import Navbar from "@/components/Navbar";
import { Shield, Plus, Package, Edit, Trash } from "lucide-react";

export default function AdminDashboard() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic mb-2 text-neon-pink flex items-center gap-3">
                            <Shield className="w-10 h-10" /> ADMIN DASHBOARD
                        </h1>
                        <p className="text-gray-400 font-bold tracking-widest">MANAGE YOUR EMPIRE</p>
                    </div>
                    <button className="bg-neon-green text-black font-black uppercase px-6 py-3 rounded hover:bg-white transition-colors flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Add New Jersey
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                        <h3 className="text-gray-400 font-bold mb-2">TOTAL ORDERS</h3>
                        <p className="text-4xl font-black text-neon-blue">0</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                        <h3 className="text-gray-400 font-bold mb-2">TOTAL REVENUE</h3>
                        <p className="text-4xl font-black text-neon-purple">₹0</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                        <h3 className="text-gray-400 font-bold mb-2">PRODUCTS STOCK</h3>
                        <p className="text-4xl font-black text-neon-green">0</p>
                    </div>
                </div>

                {/* Products Table Area (Placeholder) */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-black italic">ALL JERSEYS</h2>
                    </div>
                    <div className="p-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Inventory management coming next...</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
