import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function OfflinePage() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className="max-w-md w-full relative"
            >
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full" />
                
                <div className="relative glass-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50" />
                    
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <WifiOff className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h1 className="text-3xl font-heading font-black tracking-tight text-foreground mb-4">
                        Oops!
                    </h1>
                    
                    <h2 className="text-lg font-tech font-bold text-red-500 uppercase tracking-widest mb-4">
                        No Internet Connection
                    </h2>
                    
                    <p className="text-muted-foreground font-sans leading-relaxed text-sm mb-8">
                        It looks like you've lost your connection to the grid. Please check your Wi-Fi or cellular data and try again.
                    </p>
                    
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 transition-all shadow-xl border border-primary/50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry Connection
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
