import React from "react";
import { Settings, Sparkles, Hammer, Clock } from "lucide-react";
import Head from "next/head";
import { motion } from "framer-motion";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans text-foreground selection:bg-primary/40 selection:text-white">
            <Head>
                <title>We'll be right back! | Swapifhy</title>
            </Head>
            
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]" 
                />
                
                {/* Floating particles */}
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto w-full"
            >
                {/* Logo */}
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                    className="mb-16"
                >
                    <img 
                        src="/images/features/swapifhy-logo-DPxPDdg-.png" 
                        alt="Swapifhy Logo" 
                        className="h-14 md:h-16 w-auto drop-shadow-xl dark:brightness-125 mx-auto hover:scale-105 transition-transform duration-500" 
                    />
                </motion.div>

                {/* Animated Graphic */}
                <div className="relative mb-12 flex items-center justify-center h-40 w-40">
                    {/* Glowing pulse rings */}
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/20 rounded-full blur-xl" 
                    />
                    
                    <div className="absolute w-32 h-32 rounded-full glass-elite border-2 border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(75,100,250,0.2)]">
                        {/* Main rotating gear */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <Settings className="w-12 h-12 text-primary" />
                        </motion.div>
                    </div>

                    {/* Orbiting Elements */}
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-elite border border-border flex items-center justify-center shadow-lg bg-surface">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                    </motion.div>

                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full"
                    >
                        <div className="absolute bottom-4 right-0 w-8 h-8 rounded-full glass-elite border border-border flex items-center justify-center shadow-lg bg-surface">
                            <Hammer className="w-4 h-4 text-secondary" />
                        </div>
                    </motion.div>
                </div>

                {/* Friendly Content */}
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-black font-heading mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary pb-2"
                >
                    We're getting a glow-up!
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-muted-foreground/90 mb-12 max-w-lg leading-relaxed"
                >
                    Swapifhy is currently undergoing some awesome upgrades. We're polishing the gears and adding new features. We'll be back online before you know it!
                </motion.p>

                {/* Status Indicator */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="px-6 py-4 glass-elite rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-4 group"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-500">
                        <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-foreground">Estimated Wait Time</h3>
                        <p className="text-xs font-medium text-muted-foreground">Just a few moments...</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
