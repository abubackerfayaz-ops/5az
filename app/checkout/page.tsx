'use client';

import Navbar from "@/components/Navbar";
import { CheckCircle, CreditCard, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    if (cart.length === 0 && step === 1) {
        return (
            <main className="min-h-screen pt-20 bg-black text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
                    <Link href="/shop" className="bg-neon-blue text-black font-bold px-8 py-4 uppercase">
                        Start Shopping
                    </Link>
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
        setLoading(true);
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        // Create Order on Backend
        const orderData = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: cartTotal * 100, currency: 'INR' }),
        }).then((t) => t.json());

        if (orderData.error) {
            alert(orderData.error);
            setLoading(false);
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Usually public key from env
            amount: orderData.amount,
            currency: orderData.currency,
            name: "5az Jersey Store",
            description: "Jersey Purchase",
            image: "https://placehold.co/150x150/00f3ff/000000.png?text=5AZ", // Branding logo
            order_id: orderData.id,
            handler: async function (response: any) {
                // Verify Payment
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
                    // Create actual order in DB here if needed
                    setStep(2);
                    clearCart();
                } else {
                    alert('Payment verification failed');
                }
            },
            prefill: {
                name: "Test User",
                email: "test@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#00f3ff",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoading(false);
    };

    return (
        <main className="min-h-screen pt-20 bg-black text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black italic uppercase mb-8 border-b border-white/10 pb-4">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Shipping Info */}
                        <div className={`bg-white/5 border ${step === 1 ? 'border-neon-blue' : 'border-white/10'} p-6 rounded-lg`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="bg-neon-blue text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Shipping Details
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" className="bg-black border border-white/20 p-3 rounded text-white" />
                                    <input type="text" placeholder="Last Name" className="bg-black border border-white/20 p-3 rounded text-white" />
                                </div>
                                <input type="text" placeholder="Address" className="w-full bg-black border border-white/20 p-3 rounded text-white" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="City" className="bg-black border border-white/20 p-3 rounded text-white" />
                                    <input type="text" placeholder="Pincode" className="bg-black border border-white/20 p-3 rounded text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className={`bg-white/5 border ${step === 2 ? 'border-neon-blue' : 'border-white/10'} p-6 rounded-lg opacity-${step === 1 ? '50' : '100'}`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Payment
                            </h2>
                            {step === 1 && (
                                <div className="bg-white/5 p-4 rounded text-sm text-gray-400">
                                    Continue to payment to select method.
                                </div>
                            )}
                            {step === 2 && (
                                <div className="text-green-400 font-bold">
                                    Payment Successful
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg h-fit">
                        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                        <div className="space-y-4 mb-6">
                            {step === 1 ? (
                                cart.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                        <div>
                                            <span className="block font-bold">{item.name}</span>
                                            <span className="text-gray-400 text-xs">Size: {item.size} | Qty: {item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>₹{item.price * item.quantity}</span>
                                            <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-green-400 py-4">
                                    Order Placed Successfully!
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm mt-4">
                                <span>Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>

                        {step === 1 ? (
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-neon-blue text-black font-black uppercase py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Pay with Razorpay'}
                            </button>
                        ) : (
                            <button className="w-full bg-green-500 text-black font-black uppercase py-3 rounded hover:bg-green-400 transition-colors flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Download Invoice
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
