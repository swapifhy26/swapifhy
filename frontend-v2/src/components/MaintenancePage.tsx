import React, { useState, useEffect } from "react";
import { Settings, Sparkles, Clock, Hammer } from "lucide-react";
import Head from "next/head";
import { motion } from "framer-motion";

export default function MaintenancePage({ remark, endTime }: { remark?: string, endTime?: string | null }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!endTime) return;
        const target = new Date(endTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff <= 0) {
                setTimeLeft("00:00:00");
                // Force an immediate reload so the user gets back in instantly without waiting for the 30s polling
                if (!window.maintenanceReloaded) {
                    window.maintenanceReloaded = true;
                    setTimeout(() => window.location.reload(), 1500);
                }
                return;
            }
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            // Format HH:MM:SS
            setTimeLeft(
                (h > 0 ? h.toString().padStart(2, '0') + ':' : '') +
                m.toString().padStart(2, '0') + ':' +
                s.toString().padStart(2, '0')
            );
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans text-foreground selection:bg-primary/40 selection:text-white">
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
                    className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[50%] h-[50%] rounded-full bg-primary/20 blur-[60px] md:blur-[120px] mix-blend-screen" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[60px] md:blur-[120px] mix-blend-screen" 
                />
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center p-4 md:p-8 text-center max-w-2xl mx-auto w-full h-full overflow-y-auto overflow-x-hidden"
            >
                {/* Logo */}
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                    className="mb-10 md:mb-20"
                >
                    <img 
                        src="/images/features/swapifhy-logo-DPxPDdg-.png" 
                        alt="Swapifhy Logo" 
                        className="h-14 md:h-16 w-auto drop-shadow-xl dark:brightness-125 mx-auto hover:scale-105 transition-transform duration-500" 
                    />
                </motion.div>

                {/* Animated Graphic - INTERLOCKING GEARS */}
                <div className="relative mb-12 md:mb-16 flex items-center justify-center h-40 w-40 md:h-48 md:w-48 scale-90 md:scale-100">
                    <motion.div 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/30 rounded-full blur-3xl z-0" 
                    />

                    {/* Central Primary Gear */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-28 h-28 rounded-full glass-elite flex items-center justify-center border border-primary/40 shadow-[0_0_30px_rgba(91,196,192,0.3)] bg-surface/50 backdrop-blur-xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            >
                                <Settings className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(91,196,192,0.8)]" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Top Right Secondary Gear */}
                    <div className="absolute -top-4 -right-4 z-20">
                        <div className="w-16 h-16 rounded-full glass-elite flex items-center justify-center border border-secondary/40 shadow-lg bg-surface/80 backdrop-blur-xl">
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                                <Settings className="w-8 h-8 text-secondary drop-shadow-[0_0_10px_rgba(107,143,212,0.8)]" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom Left Amber Gear */}
                    <div className="absolute -bottom-6 -left-6 z-20">
                        <div className="w-20 h-20 rounded-full glass-elite flex items-center justify-center border border-amber-500/40 shadow-lg bg-surface/80 backdrop-blur-xl">
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                                <Settings className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        animate={{ y: [0, -15, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 -left-8 z-30"
                    >
                        <Sparkles className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    </motion.div>
                    
                    <motion.div
                        animate={{ y: [0, 15, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-4 -right-10 z-30"
                    >
                        <Sparkles className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(91,196,192,0.8)]" />
                    </motion.div>
                </div>

                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-5xl font-black font-heading mb-4 md:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary pb-2 px-4"
                >
                    We're getting a glow-up!
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base md:text-xl text-muted-foreground/90 mb-8 md:mb-12 max-w-lg leading-relaxed whitespace-pre-wrap px-4"
                >
                    {remark || "Swapifhy is currently undergoing some awesome upgrades. We're polishing the gears and adding new features. We'll be back online before you know it!"}
                </motion.p>

                {/* Status Indicator */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="px-6 py-4 glass-elite rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-4 group hover:bg-surface/60 transition-colors"
                >
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-500">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping"></span>
                        <Clock className="w-5 h-5 relative z-10" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-foreground">Estimated Wait Time</h3>
                        <p className="text-xs font-medium text-muted-foreground font-mono text-lg">
                            {endTime && timeLeft ? timeLeft : "Just a few moments..."}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
