import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Globe, Github, Linkedin, Instagram, Phone, Mail, Link as LinkIcon, Zap, Check } from "lucide-react";

interface SyncBridgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (details: any) => void;
    userProfile: any;
}

export const SyncBridgeModal = ({ isOpen, onClose, onShare, userProfile }: SyncBridgeModalProps) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [customLink, setCustomLink] = useState("");
    const [customLabel, setCustomLabel] = useState("");

    const options = [
        { id: "email", label: "Professional Email", value: userProfile?.email, icon: <Mail className="w-4 h-4" /> },
        { id: "phone", label: "Mobile Coordinates", value: userProfile?.phoneNumber, icon: <Phone className="w-4 h-4" /> },
        { id: "github", label: "GitHub Profile", value: userProfile?.github, icon: <Github className="w-4 h-4" /> },
        { id: "linkedin", label: "LinkedIn Bridge", value: userProfile?.linkedin, icon: <Linkedin className="w-4 h-4" /> },
        { id: "instagram", label: "Portfolio Feed", value: userProfile?.instagram, icon: <Instagram className="w-4 h-4" /> },
        { id: "other", label: "Primary Website", value: userProfile?.otherLink, icon: <LinkIcon className="w-4 h-4" /> },
    ];

    const toggleOption = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        const sharedDetails: any = {};
        selected.forEach(id => {
            const opt = options.find(o => o.id === id);
            if (opt && opt.value) sharedDetails[id] = opt.value;
        });
        if (customLink) {
            sharedDetails.custom = { label: customLabel || "Meeting Link", url: customLink };
        }
        onShare(sharedDetails);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        onClick={onClose}
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: "spring", damping: 20, stiffness: 150 }}
                        className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden relative"
                    >
                        {/* DECORATIVE BACKGROUND LIGHT */}
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="p-10 relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black text-white uppercase tracking-tight font-heading">Secure Data Transmission</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1 h-1 bg-primary rounded-full" />
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Privacy Protocol active</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose} 
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-zinc-500 hover:text-white transition-all shadow-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => opt.value && toggleOption(opt.id)}
                                        disabled={!opt.value}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                                            selected.includes(opt.id) 
                                                ? "bg-primary/10 border-primary/40 text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                                : opt.value 
                                                    ? "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/[0.04]" 
                                                    : "bg-transparent border-white/5 opacity-10 cursor-not-allowed"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                            selected.includes(opt.id) ? "bg-primary text-white" : "bg-white/5 text-zinc-600"
                                        }`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${selected.includes(opt.id) ? "text-primary" : "text-zinc-500"}`}>
                                                {opt.label}
                                            </p>
                                            {opt.value && (
                                                <p className="text-[11px] truncate opacity-60 font-medium mt-0.5 text-white">
                                                    {opt.value}
                                                </p>
                                            )}
                                        </div>
                                        {selected.includes(opt.id) && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] px-2">
                                        External Coordination Hub
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input 
                                            value={customLabel} onChange={e => setCustomLabel(e.target.value)} 
                                            placeholder="Hub (Zoom)" 
                                            className="w-full sm:w-[160px] bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-zinc-700 text-xs focus:outline-none focus:border-primary/50 transition-colors" 
                                        />
                                        <input 
                                            value={customLink} onChange={e => setCustomLink(e.target.value)} 
                                            placeholder="Transmission URI (https://...)" 
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-zinc-700 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-6 items-center">
                                <p className="text-[10px] text-zinc-600 italic text-center max-w-[400px]">
                                    Sharing contact info is encrypted and secure. You can remove these details from your history at any time.
                                </p>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={selected.length === 0 && !customLink}
                                    className={`w-full py-5 rounded-2xl text-xs uppercase tracking-[0.4em] font-black transition-all ${
                                        selected.length > 0 || customLink
                                            ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.01] shadow-2xl shadow-primary/20"
                                            : "bg-white/5 text-zinc-700 cursor-not-allowed"
                                    }`}
                                >
                                    Share Contact Info
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
