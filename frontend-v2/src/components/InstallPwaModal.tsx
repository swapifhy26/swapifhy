import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, ArrowUpRight, Smartphone, Sparkles, Check } from 'lucide-react';
import { haptic } from '../lib/haptics';

interface InstallPwaModalProps {
    isOpen: boolean;
    onClose: () => void;
    isIOS: boolean;
    onInstallAndroid?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
    isOpen,
    onClose,
    isIOS,
    onInstallAndroid
}) => {
    if (!isOpen) return null;

    const handleDismiss = () => {
        haptic.light();
        onClose();
    };

    const handleAction = () => {
        haptic.success();
        if (!isIOS && onInstallAndroid) {
            onInstallAndroid();
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Glass Bottom Sheet / Modal */}
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 26, stiffness: 300 }}
                    className="relative w-full max-w-lg glass-dock bg-surface/90 dark:bg-slate-900/90 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden border border-white/20 pb-safe"
                >
                    {/* Pull bar on mobile */}
                    <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-6 sm:hidden" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-black/40 shrink-0 border border-white/10">
                                <img 
                                    src="/icon-192.png" 
                                    alt="Swapifhy Logo" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-black tracking-tight text-foreground flex items-center gap-1.5">
                                    Swapifhy App
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        Pro
                                    </span>
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {isIOS ? 'Install on iPhone & iPad' : 'Install on Android'}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleDismiss}
                            className="p-2 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Features Banner */}
                    <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                        <div>
                            <div className="text-base font-black text-primary font-mono">0ms</div>
                            <div className="text-[10px] text-muted-foreground font-semibold">Zero Lag</div>
                        </div>
                        <div className="border-x border-border/40">
                            <div className="text-base font-black text-emerald-500 font-mono">100%</div>
                            <div className="text-[10px] text-muted-foreground font-semibold">Fullscreen</div>
                        </div>
                        <div>
                            <div className="text-base font-black text-accent font-mono">🔔 Instant</div>
                            <div className="text-[10px] text-muted-foreground font-semibold">Push Alerts</div>
                        </div>
                    </div>

                    {/* iOS Step-by-Step Instructions */}
                    {isIOS ? (
                        <div className="space-y-3.5 mb-6 text-left">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                3 Simple Steps in Safari:
                            </p>

                            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-foreground/[0.03] border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Share className="w-5 h-5" />
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-foreground">Step 1: </span>
                                    Tap the <strong className="text-primary">Share</strong> button at the bottom of Safari.
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-foreground/[0.03] border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <PlusSquare className="w-5 h-5" />
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-foreground">Step 2: </span>
                                    Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong>.
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-foreground/[0.03] border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-foreground">Step 3: </span>
                                    Tap <strong className="text-foreground">"Add"</strong> in the top right corner.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 text-center py-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Install Swapifhy directly to your home screen with 1 tap. Enjoy native phone alerts, lightning-fast matching, and offline capabilities.
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleAction}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 text-white font-bold text-sm tracking-tight shadow-xl shadow-primary/25 active-press flex items-center justify-center gap-2"
                    >
                        {isIOS ? (
                            <>Got it, I'm ready to add <ArrowUpRight className="w-4 h-4" /></>
                        ) : (
                            <>Install Swapifhy Now <Sparkles className="w-4 h-4" /></>
                        )}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
