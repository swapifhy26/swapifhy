import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { InstallPwaModal } from './InstallPwaModal';
import { haptic } from '../lib/haptics';

export const InstallPwaBanner: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already in standalone PWA mode
        const standaloneMode = 
            window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as any).standalone === true;
        
        setIsStandalone(standaloneMode);
        if (standaloneMode) return;

        // Check if dismissed recently (within 48 hours)
        const dismissedAt = localStorage.getItem('swapifhy_pwa_dismissed');
        if (dismissedAt) {
            const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
            if (daysPassed < 2) return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(iOSDevice);

        // Listen for Android beforeinstallprompt
        const handleBeforeInstall = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // On iOS Safari, show the banner after a gentle 3-second delay
        if (iOSDevice && !standaloneMode) {
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleOpenModal = () => {
        haptic.light();
        setShowModal(true);
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        haptic.light();
        setShowBanner(false);
        localStorage.setItem('swapifhy_pwa_dismissed', Date.now().toString());
    };

    const handleInstallAndroid = async () => {
        if (!deferredPrompt) return;
        haptic.success();
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            setShowBanner(false);
            setShowModal(false);
        }
        setDeferredPrompt(null);
    };

    if (isStandalone || !showBanner) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", damping: 24, stiffness: 260 }}
                    className="md:hidden fixed top-3 left-3 right-3 z-[110]"
                >
                    <div 
                        onClick={handleOpenModal}
                        className="glass-dock bg-surface/90 dark:bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/20 flex items-center justify-between cursor-pointer active-press"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary p-0.5 shadow-md shrink-0">
                                <img 
                                    src="/images/features/swapifhy-logo-DPxPDdg-.png" 
                                    alt="Swapifhy Logo" 
                                    className="w-full h-full object-contain rounded-[10px] bg-white p-0.5"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                                    Swapifhy Mobile
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate">
                                    ⚡ 10x faster &amp; real-time alerts
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-extrabold tracking-tight shadow-md shadow-primary/20 flex items-center gap-1">
                                GET APP <Sparkles className="w-3 h-3" />
                            </span>
                            <button
                                onClick={handleDismiss}
                                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <InstallPwaModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isIOS={isIOS}
                onInstallAndroid={handleInstallAndroid}
            />
        </>
    );
};
