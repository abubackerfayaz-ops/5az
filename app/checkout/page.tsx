'use client';

import Navbar from "@/components/Navbar";
import { CheckCircle, CreditCard, Smartphone, Trash2, ShieldCheck, Lock, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';
import { motion } from "framer-motion";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        pincode: '',
        email: '',
        phone: ''
    });

    // Hydration fix
    if (!mounted) return null;

    if (cart.length === 0 && step === 1) {
        return (
            <main className="min-h-screen bg-[#030303] text-white selection:bg-[#D9FF00] selection:text-black relative overflow-hidden">
                <div className="absolute inset-0 cyber-grid opacity-10" />
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center z-10 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-5xl md:text-7xl font-display font-black italic tracking-tighter text-white/20">EMPTY_CART</h2>
                        <p className="text-xl font-mono text-[#D9FF00]">YOUR ARMORY IS EMPTY, ROOKIE.</p>
                        <Link href="/shop" className="inline-block bg-[#D9FF00] hover:bg-white text-black font-black font-display italic tracking-widest px-10 py-4 uppercase transition-all hover:scale-105 hover:shadow-[0_0_30px_#D9FF00]/50 skew-x-[-10deg]">
                            <span className="skew-x-[10deg] block">INITIATE PURCHASE</span>
                        </Link>
                    </motion.div>
                </div>
            </main>
        )
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!formData.firstName || !formData.address || !formData.city || !formData.pincode || !formData.phone) {
            alert('Please fill in all shipping coordinates.');
            return;
        }

        setLoading(true);
        const res = await loadRazorpay();

        if (!res) {
            alert('Payment Gateway Connection Failed.');
            setLoading(false);
            return;
        }

        try {
            // Create Order on Backend
            const orderData = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        size: item.size
                    })),
                    shippingAddress: {
                        street: formData.address,
                        city: formData.city,
                        state: 'Maharashtra', // Placeholder
                        pincode: formData.pincode,
                        country: 'India'
                    },
                    guestInfo: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        phone: formData.phone
                    },
                    currency: 'INR'
                }),
            }).then((t) => t.json());

            if (orderData.error) throw new Error(orderData.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: orderData.amount,
                currency: orderData.currency,
                name: "5AZ ARCHIVE",
                description: "PREMIUM FOOTBALL GEAR",
                image: "https://placehold.co/150x150/000000/D9FF00.png?text=5AZ",
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const data = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        }).then((t) => t.json());

                        if (data.status === 'success') {
                            setStep(2);
                            clearCart();
                        } else {
                            alert('Payment verification failed');
                        }
                    } catch (err) {
                        alert('Verification Error');
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#D9FF00", // Lime Green matches brand
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error: any) {
            alert(error.message || 'Something went wrong');
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <main className="min-h-screen bg-[#030303] text-white selection:bg-[#FF0080] selection:text-white relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 cyber-grid opacity-5" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D9FF00]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF0080]/5 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-[1px] w-12 bg-[#D9FF00]" />
                    <h1 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                        SECURE_CHECKOUT
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Shipping Info Card */}
                        <div className={`relative group transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            {/* Glass Card Effect */}
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10" />
                            <div className="relative p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-[#D9FF00] flex items-center justify-center">
                                        <span className="font-display font-black text-black">01</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-display font-black uppercase tracking-wider">Shipping Coordinates</h2>
                                        <p className="text-xs font-mono text-white/40">ENTER DESTINATION DETAILS</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">First Name</label>
                                            <input type="text" name="firstName" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">Last Name</label>
                                            <input type="text" name="lastName" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">Delivery Address</label>
                                        <input type="text" name="address" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">City</label>
                                            <input type="text" name="city" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">Pincode</label>
                                            <input type="text" name="pincode" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">Email Protocol</label>
                                            <input type="email" name="email" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#D9FF00]">Contact Comms</label>
                                            <input type="text" name="phone" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 focus:border-[#D9FF00] p-4 rounded-none text-white transition-colors outline-none font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className={`relative group transition-all duration-500 ${step === 2 ? 'opacity-100 ring-2 ring-[#D9FF00]' : 'opacity-80'}`}>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10" />
                            <div className="relative p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-[#D9FF00] text-black' : 'bg-white/10 text-white'}`}>
                                        <span className="font-display font-black text-black">02</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-display font-black uppercase tracking-wider">Payment Gateway</h2>
                                        <p className="text-xs font-mono text-white/40">SECURED BY RAZORPAY</p>
                                    </div>
                                </div>

                                {step === 2 ? (
                                    <div className="bg-[#D9FF00]/10 border border-[#D9FF00] p-6 rounded-lg text-center">
                                        <CheckCircle className="w-12 h-12 text-[#D9FF00] mx-auto mb-4" />
                                        <h3 className="text-2xl font-display font-black italic text-white uppercase">ORDER CONFIRMED</h3>
                                        <p className="font-mono text-sm text-white/60 mt-2">TRANSACTION ID: #5AZ-{Math.floor(Math.random() * 10000)}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg bg-black/20">
                                        <Lock className="w-5 h-5 text-[#D9FF00]" />
                                        <span className="font-mono text-xs text-white/60">Fully encrypted 256-bit payment channel</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-fit sticky top-32"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#D9FF00]/20 to-[#FF0080]/20 blur-xl opacity-20" />
                            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                                <h3 className="text-xl font-display font-black italic uppercase mb-6 flex items-center justify-between">
                                    <span>Manifest</span>
                                    <span className="text-[#D9FF00] text-sm not-italic font-mono">({cart.length})</span>
                                </h3>

                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                                            <div className="w-16 h-16 bg-white/5 rounded border border-white/10 overflow-hidden relative">
                                                {/* Image Placeholder if no real image */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm uppercase leading-tight group-hover:text-[#D9FF00] transition-colors">{item.name}</h4>
                                                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-white/20 hover:text-[#FF0080] transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div className="text-xs font-mono text-white/40">
                                                        SIZE: {item.size} <br /> QTY: {item.quantity}
                                                    </div>
                                                    <div className="font-display font-bold">₹{item.price * item.quantity}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex justify-between text-white/60">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-[#D9FF00]">
                                        <span>Shipping</span>
                                        <span className="uppercase text-xs tracking-widest">Complimentary</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="font-display font-black italic text-xl">TOTAL</span>
                                        <span className="font-display font-black italic text-3xl text-[#D9FF00]">₹{cartTotal}</span>
                                    </div>

                                    {step === 1 ? (
                                        <button
                                            onClick={handlePayment}
                                            disabled={loading}
                                            className="w-full relative group overflow-hidden bg-white text-black font-display font-black italic text-xl uppercase py-5 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="relative z-10">{loading ? 'ESTABLISHING LINK...' : 'INITIATE PAYMENT'}</span>
                                            <div className="absolute inset-0 bg-[#D9FF00] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                                        </button>
                                    ) : (
                                        <div className="w-full bg-[#D9FF00] text-black font-display font-black italic text-xl uppercase py-5 text-center flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-6 h-6" />
                                            SECURED
                                        </div>
                                    )}

                                    <p className="text-center mt-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        Encrypted by 5AZ Protocol
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
