import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Loader = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
            {/* Ambient Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px] opacity-[0.1] animate-pulse" />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-t-2 border-primary"
                />
                
                {/* Inner Icon */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-8 h-8 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground animate-pulse"
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    );
};
