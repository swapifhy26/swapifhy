import React from "react";
import { motion } from "framer-motion";

export const SwapifhyLogo = ({ className = "w-10 h-10", pulse = true }: { className?: string, pulse?: boolean }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Background Glow */}
                <circle cx="50" cy="50" r="40" fill="url(#logo_gradient)" fillOpacity="0.1" />
                
                {/* Outer Sync Rings */}
                <motion.circle 
                    cx="50" cy="50" r="45" 
                    stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" strokeOpacity="0.2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Interlocking Exchange Arrows (Stylized S) */}
                <motion.path 
                    d="M30 40C30 30 40 25 50 25C65 25 70 35 70 45C70 55 60 60 50 60C40 60 30 65 30 75C30 85 40 90 50 90C65 90 70 80 70 70" 
                    stroke="url(#logo_gradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                
                {/* Central Sync Node */}
                <motion.circle 
                    cx="50" cy="50" r="6" 
                    fill="currentColor"
                    animate={pulse ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <defs>
                    <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#d6c4ff" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
};
