import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Shield, Zap, Trash2, Github, Linkedin, Instagram, Phone, Mail, Link as LinkIcon, User, ArrowRight, Plus, ExternalLink, MoreVertical, Lock, Maximize2, Minimize2, CheckCircle, Activity, Share2 } from "lucide-react";
import { SyncBridgeModal } from "./SyncBridgeModal";
import { API_URL } from "../lib/api";

interface Message {
    id: string;
    senderId: string;
    content: string;
    type: string;
    details?: any;
    isRevoked: boolean;
    createdAt: string;
}

interface ChatPanelProps {
    swapId: string;
    onClose: () => void;
    currentUserId: string;
}

// Helper to clean up legacy jargon from existing messages
const cleanJargon = (text: string) => {
    if (!text) return text;
    return text
        .replace(/Sync Protocol Initialized/gi, "Swap started")
        .replace(/securely share coordinates/gi, "share contact info")
        .replace(/Privacy Protocol: Coordinates Revoked/gi, "Contact info removed")
        .replace(/Sync Bridge Shared/gi, "Link shared")
        .replace(/Contact Coordinates Shared/gi, "Contact info shared");
};

export const ChatPanel = ({ swapId, onClose, currentUserId }: ChatPanelProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [partner, setPartner] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/chat/messages/${swapId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (data.partner) setPartner(data.partner);
        } catch (err) { console.error(err); }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/user/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.user) setUserProfile(data.user);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (swapId) {
            fetchData();
            fetchProfile();
            const interval = setInterval(fetchData, 3000);
            return () => clearInterval(interval);
        }
    }, [swapId]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (type = "TEXT", details: any = null) => {
        if (type === "TEXT" && !inputText.trim()) return;
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/chat/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ swapId, content: type === "TEXT" ? inputText : null, type, details })
            });
            if (res.ok) {
                setInputText("");
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const revokeMessage = async (messageId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(`${API_URL}/api/chat/revoke/${messageId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const VerifiedNodeChip = ({ msg }: { msg: Message }) => {
        if (msg.isRevoked) {
            return (
                <div className="p-4 rounded-xl bg-slate-900/10 border border-white/5 flex items-center gap-3 opacity-40">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <p className="text-[11px] font-medium text-zinc-500 italic">Access removed.</p>
                </div>
            );
        }

        let details: any = {};
        try {
            details = typeof msg.details === 'string' ? JSON.parse(msg.details) : (msg.details || {});
        } catch (e) {
            console.error("[ChatPanel] Malformed details node:", e);
        }
        const keys = Object.keys(details);

        return (
            <div className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden transition-all bg-slate-950/40 backdrop-blur-xl ${msg.senderId === currentUserId ? "border-indigo-500/20" : "border-white/10"}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Verified Contact Info</p>
                    </div>
                    {msg.senderId === currentUserId && (
                        <button onClick={() => revokeMessage(msg.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {keys.map(key => {
                        let icon = <LinkIcon className="w-3.5 h-3.5" />;
                        let label = key.toUpperCase();
                        let value = details[key];

                        if (key === 'email') { icon = <Mail className="w-3.5 h-3.5 text-indigo-400" />; label = "Email"; }
                        if (key === 'phone') { icon = <Phone className="w-3.5 h-3.5 text-indigo-400" />; label = "Phone"; }
                        if (key === 'github') { icon = <Github className="w-3.5 h-3.5 text-indigo-400" />; label = "GitHub"; }
                        if (key === 'linkedin') { icon = <Linkedin className="w-3.5 h-3.5 text-indigo-400" />; label = "LinkedIn"; }
                        if (key === 'instagram') { icon = <Instagram className="w-3.5 h-3.5 text-indigo-400" />; label = "Instagram"; }
                        if (key === 'custom') { icon = <Activity className="w-3.5 h-3.5 text-rose-500" />; label = details[key].label; value = details[key].url; }

                        return (
                            <a key={key} href={value.startsWith('http') ? value : `mailto:${value}`} target="_blank" className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all group/item shadow-inner">
                                <div className="flex items-center gap-3.5 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/5 flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-transform">
                                        {icon}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5 opacity-60 leading-none">{label}</p>
                                        <p className="text-[12px] text-white/90 truncate font-sans font-medium tracking-tight">{value}</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-3 h-3 text-zinc-700 group-hover/item:text-indigo-400 group-hover/item:translate-x-0.5 transition-all" />
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className={`fixed top-[85px] right-0 h-[calc(100vh-85px)] z-[150] shadow-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? "w-[100vw] lg:w-[65%] xl:w-[60%] 2xl:w-[50%]" : "w-[100vw] lg:w-[360px] xl:w-[440px]"}`}>
                <motion.div 
                    initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} 
                    transition={{ type: "spring", damping: 30, stiffness: 180 }}
                    className="h-full bg-slate-950/90 border-l border-white/10 flex flex-col shadow-3xl backdrop-blur-[50px] overflow-hidden"
                >
                    {/* ELITE HEADER - PRECISE GRID */}
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-5">
                            <div className="relative group cursor-pointer">
                                {partner?.avatarUrl ? (
                                    <img src={partner.avatarUrl} alt={partner.name} className="w-12 h-12 rounded-2xl border border-white/10 object-cover shadow-2xl transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-xl">
                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[16px] font-black text-white leading-tight font-heading tracking-tight mb-1">{partner?.name || "Connecting..."}</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                        <Zap className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400/20" />
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{partner?.bio?.split(' ')?.[0] || "PRO"}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] opacity-40 italic">Active Exchange</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all hidden lg:flex items-center justify-center group"
                                title={isExpanded ? "Collapse Suite" : "Expand Infrastructure"}
                            >
                                {isExpanded ? <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </button>
                            <button className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all group"><MoreVertical className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
                            <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500/40 hover:text-white transition-all border border-transparent hover:border-white/10 group"><X className="w-5 h-5 group-hover:rotate-90 transition-transform" /></button>
                        </div>
                    </div>

                    {/* ARCHITECTURAL MESSAGING - LAYERED SHADOWS */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide modern-scroll custom-scrollbar" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60">
                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10">
                                    <Lock className="w-7 h-7 text-indigo-400 opacity-60" />
                                </div>
                                <h5 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/50 mb-3 ml-2">Secure Messaging Online</h5>
                                <p className="text-[12px] text-zinc-500 max-w-[220px] leading-relaxed font-medium">All swap logs are encrypted and private by design.</p>
                            </div>
                        ) : messages.map((msg, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ type: "spring", damping: 25, delay: idx * 0.02 }}
                                key={msg.id} 
                                className={`flex flex-col ${msg.senderId === currentUserId ? "items-end" : "items-start"}`}
                            >
                                {msg.senderId === "SYSTEM" ? (
                                    <div className="w-full relative py-6 flex justify-center items-center">
                                        <div className="absolute left-0 right-0 h-px bg-white/5" />
                                        <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 bg-slate-950 px-6 py-2 rounded-full border border-white/5">{msg.content}</span>
                                    </div>
                                ) : (
                                    <div className={`max-w-[85%] space-y-2 group ${msg.senderId === currentUserId ? "items-end" : "items-start"}`}>
                                        {msg.type === "TEXT" ? (
                                             <div className={`p-5 px-7 rounded-[2rem] text-[14px] leading-relaxed shadow-3xl transition-all font-sans relative overflow-hidden ${
                                                msg.senderId === currentUserId 
                                                ? "bg-indigo-600 text-white rounded-tr-sm shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)] ring-1 ring-white/10" 
                                                : "bg-[#0B0F1A]/80 text-white border border-white/[0.06] rounded-tl-sm backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                                             }`}>
                                                {cleanJargon(msg.content)}
                                                {msg.senderId === currentUserId && (
                                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                                )}
                                            </div>
                                        ) : (
                                            <VerifiedNodeChip msg={msg} />
                                        )}
                                        <div className={`flex items-center gap-3 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ${msg.senderId === currentUserId ? "flex-row-reverse translate-x-2" : "-translate-x-2"}`}>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <div className={`w-1 h-1 rounded-full ${msg.senderId === currentUserId ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-white/10"}`} />
                                            {msg.senderId === currentUserId && <Share2 className="w-3 h-3 text-zinc-700" />}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* PRECISION INPUT BAR - FLOATING DOCK DESIGN */}
                    <div className="p-8 bg-slate-950/40 border-t border-white/5 backdrop-blur-[80px] shadow-[0_-10px_50px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-4 bg-white/[0.02] p-2.5 pr-3 rounded-[1.75rem] border border-white/[0.06] focus-within:border-indigo-500/50 focus-within:bg-white/[0.04] transition-all shadow-inner relative overflow-hidden group/input">
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                            
                            <button 
                                onClick={() => setIsBridgeModalOpen(true)} 
                                className="p-3.5 bg-white/5 hover:bg-indigo-500/10 rounded-2xl border border-white/5 text-zinc-500 hover:text-indigo-400 transition-all group/plus"
                                title="Share Contact Info"
                            >
                                <Plus className="w-5 h-5 transition-transform group-hover/plus:rotate-90 group-focus-within/input:scale-110" />
                            </button>
                            
                            <input 
                                value={inputText} onChange={e => setInputText(e.target.value)} 
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Send a message..." 
                                className="flex-1 bg-transparent border-none py-3 text-white text-[15px] placeholder:text-zinc-700 focus:outline-none font-sans font-medium tracking-tight" 
                            />
                            
                            <button 
                                onClick={() => sendMessage()} 
                                disabled={!inputText.trim()}
                                className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all ${
                                    inputText.trim() 
                                    ? "bg-white text-black shadow-2xl hover:scale-105 active:scale-95" 
                                    : "bg-white/5 text-zinc-800 cursor-not-allowed opacity-20"
                                }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-5 flex items-center justify-center gap-4 opacity-40">
                             <div className="h-px w-8 bg-zinc-800" />
                             <h4 className="text-[13px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(75,100,250,0.8)]" /> Swap Bridge
                            </h4>
                        </div>
                    </div>
                </motion.div>
                
                <SyncBridgeModal 
                    isOpen={isBridgeModalOpen} 
                    onClose={() => setIsBridgeModalOpen(false)} 
                    onShare={(details) => sendMessage("CONTACT_SHARE", details)}
                    userProfile={userProfile}
                />
            </div>
        </AnimatePresence>
    );
}
