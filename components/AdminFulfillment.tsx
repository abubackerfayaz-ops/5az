'use client';

import { useState, useEffect } from 'react';
import { Truck, ExternalLink, CheckCircle, Copy, AlertCircle } from 'lucide-react';

interface Order {
    _id: string;
    items: any[];
    shipping: any;
    fulfillment: {
        supplierStatus: string;
        supplierOrderId?: string;
    };
    totals: {
        grandTotal: number;
    };
}

export default function AdminFulfillment() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        // ideally fetch from /api/admin/orders?status=paid&fulfillment=unfulfilled
        // mocking for UI structure
        setLoading(false);
    };

    const copyShippingDetails = (shipping: any) => {
        const text = `
Name: ${shipping.name}
Address: ${shipping.street}, ${shipping.city}, ${shipping.state}, ${shipping.pincode}
Phone: ${shipping.phone}
        `.trim();
        navigator.clipboard.writeText(text);
        alert('Shipping details copied to clipboard!');
    };

    const openSupplierLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="bg-black/50 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-display font-black italic uppercase mb-6 text-[#D9FF00] flex items-center gap-3">
                <Truck className="w-6 h-6" />
                Fulfillment Command Center
            </h2>

            {loading ? (
                <div className="text-white/50 text-center py-12">SCANNING ORDERS...</div>
            ) : orders.length === 0 ? (
                <div className="text-white/30 text-center py-12 border border-dashed border-white/10 rounded-lg">
                    ALL ORDERS FULFILLED. GOOD JOB.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col md:flex-row gap-6">
                            {/* Order Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-[#D9FF00] font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold rounded">Unfulfilled</span>
                                </div>
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                            <span className="text-white/60">{item.quantity}x</span>
                                            <span className="font-bold">{item.name}</span>
                                            <span className="text-white/40 text-xs">({item.size})</span>
                                            {/* Mock Link if not creating real one yet */}
                                            <button
                                                onClick={() => openSupplierLink('https://osjerseystore.com/search?q=' + item.name)}
                                                className="text-[#D9FF00] hover:underline flex items-center gap-1 text-[10px] uppercase tracking-wider"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Supplier
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-full md:w-64 flex flex-col gap-2 justify-center">
                                <button
                                    onClick={() => copyShippingDetails(order.shipping)}
                                    className="bg-white/10 hover:bg-white/20 text-white font-mono text-xs py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Copy className="w-3 h-3" /> COPY ADDRESS
                                </button>
                                <button className="bg-[#D9FF00] hover:bg-white text-black font-bold font-display italic text-sm py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors">
                                    MARK AS ORDERED
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
