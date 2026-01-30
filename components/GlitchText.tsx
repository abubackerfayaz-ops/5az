'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function GlitchText({ text, className }: { text: string, className?: string }) {
    return (
        <div className={`relative inline-block group ${className}`}>
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-neon-blue opacity-0 group-hover:opacity-70 group-hover:translate-x-[-2px] group-hover:animate-pulse transition-all duration-100">
                {text}
            </span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-neon-pink opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] group-hover:animate-pulse transition-all duration-100 delay-75">
                {text}
            </span>
        </div>
    );
}
