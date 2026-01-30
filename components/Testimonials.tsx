'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
    {
        name: "Saurav K.",
        role: "Real Madrid Fan",
        text: "The quality of the Season 25/26 home kit is insane. The fabric feels exactly like the player version. 5AZ is the only place I trust now.",
        rating: 5
    },
    {
        name: "Abhishek M.",
        role: "Vintage Collector",
        text: "Found the 2008 United Retro here. The stitching and the sponsor logo are perfect. Better than any other site in India.",
        rating: 5
    },
    {
        name: "Priya R.",
        role: "Streetwear Enthusiast",
        text: "Shipping was surprisingly fast! Got my Mbappe jersey in 3 days. The custom name printing is top-tier.",
        rating: 5
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 px-4 bg-black relative">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center md:text-left">
                    <h3 className="text-neon-pink font-bold tracking-widest uppercase mb-2">VERIFIED DROPS</h3>
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                        WHAT THE <span className="text-white">ULTREAS</span> SAY
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl relative group hover:border-neon-pink transition-colors"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-white/10 group-hover:text-neon-pink/20 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-neon-pink text-neon-pink" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-8 italic text-lg leading-relaxed">
                                &quot;{review.text}&quot;
                            </p>

                            <div>
                                <h4 className="font-black italic text-white uppercase tracking-widest">{review.name}</h4>
                                <span className="text-xs text-gray-500 uppercase font-bold">{review.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
