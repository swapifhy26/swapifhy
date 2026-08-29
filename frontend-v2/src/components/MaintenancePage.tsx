import React from "react";
import { Zap, Wrench } from "lucide-react";
import Head from "next/head";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans text-foreground selection:bg-primary/40 selection:text-white">
            <Head>
                <title>System Maintenance | Swapifhy</title>
            </Head>
            
            {/* Background elements to match Swapifhy vibe */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
                {/* Logo */}
                <div className="mb-12">
                    <img 
                        src="/images/features/swapifhy-logo-DPxPDdg-.png" 
                        alt="Swapifhy Logo" 
                        className="h-10 w-auto drop-shadow-sm dark:brightness-125 mx-auto" 
                    />
                </div>

                {/* Animated Icon */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors duration-700 animate-pulse" />
                    <div className="w-24 h-24 rounded-full glass-elite border border-border/50 flex items-center justify-center relative shadow-2xl">
                        <Wrench className="w-10 h-10 text-primary animate-[spin_4s_linear_infinite]" />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl md:text-5xl font-black font-heading mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Upgrading the Network
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
                    We are currently performing critical maintenance to improve the Swapifhy platform. We will be back online shortly.
                </p>

                {/* Status Badge */}
                <div className="px-6 py-3 glass-elite rounded-full border border-primary/20 shadow-lg shadow-primary/5 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase text-amber-500">
                        System Offline
                    </span>
                </div>
            </div>
        </div>
    );
}
