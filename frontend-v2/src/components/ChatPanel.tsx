import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Send, Shield, Trash2, Github, Linkedin, Instagram,
    Phone, Mail, Link as LinkIcon, User, Plus, ExternalLink,
    MoreVertical, Lock, Maximize2, Minimize2, CheckCircle,
    Activity, Copy, Flag, Bell, BellOff, LogOut, Check
} from "lucide-react";
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

const cleanJargon = (text: string) => {
    if (!text) return text;
    return text
        .replace(/Sync Protocol Initialized/gi, "Swap started")
        .replace(/securely share coordinates/gi, "share contact info")
        .replace(/Privacy Protocol: Coordinates Revoked/gi, "Contact info removed")
        .replace(/Sync Bridge Shared/gi, "Link shared")
        .replace(/Contact Coordinates Shared/gi, "Contact info shared");
};

const getSafeHref = (href: string | undefined): string => {
    if (!href) return "#";
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return href;
    return `https://${href}`;
};

export const ChatPanel = ({ swapId, onClose, currentUserId }: ChatPanelProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [partner, setPartner] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [muted, setMuted] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/chat/messages/${swapId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (data.partner) {
                setPartner(data.partner);
                setIsOnline(data.partner.isOnline ?? false);
            }
        } catch (err) { console.error(err); }
    }, [swapId]);

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/user/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.user) setUserProfile(data.user);
        } catch (err) { console.error(err); }
    }, []);

    const sendHeartbeat = useCallback(async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(`${API_URL}/api/chat/heartbeat`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        if (!swapId) return;
        fetchData();
        fetchProfile();
        sendHeartbeat();

        const msgInterval = setInterval(fetchData, 3000);
        const heartbeatInterval = setInterval(sendHeartbeat, 25000);

        return () => {
            clearInterval(msgInterval);
            clearInterval(heartbeatInterval);
        };
    }, [swapId, fetchData, fetchProfile, sendHeartbeat]);

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
                body: JSON.stringify({
                    swapId,
                    content: type === "TEXT" ? inputText : null,
                    type,
                    details
                })
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

    const copyMessage = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const menuActions = [
        {
            icon: muted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />,
            label: muted ? "Unmute Notifications" : "Mute Notifications",
            onClick: () => { setMuted(m => !m); setShowMenu(false); },
            color: "text-zinc-300"
        },
        {
            icon: isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />,
            label: isExpanded ? "Collapse Chat" : "Expand Chat",
            onClick: () => { setIsExpanded(e => !e); setShowMenu(false); },
            color: "text-zinc-300"
        },
        {
            icon: <Copy className="w-4 h-4" />,
            label: "Copy Partner Name",
            onClick: () => {
                if (partner?.name) navigator.clipboard.writeText(partner.name);
                setShowMenu(false);
            },
            color: "text-zinc-300"
        },
        {
            icon: <Flag className="w-4 h-4" />,
            label: "Report User",
            onClick: () => {
                window.open(
                    `mailto:support@swapifhy.com?subject=Report: ${partner?.name}&body=Reporting user ID: ${partner?.id}`,
                    "_blank"
                );
                setShowMenu(false);
            },
            color: "text-red-400"
        },
        {
            icon: <LogOut className="w-4 h-4" />,
            label: "Close Chat",
            onClick: () => { onClose(); setShowMenu(false); },
            color: "text-zinc-500"
        },
    ];

    // ── Contact card renderer ──
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
            details = typeof msg.details === 'string'
                ? JSON.parse(msg.details)
                : (msg.details || {});
        } catch { /* malformed */ }

        const keys = Object.keys(details).filter(k => details[k]);

        if (keys.length === 0) {
            return (
                <div className="p-4 rounded-xl bg-slate-900/10 border border-white/5 flex items-center gap-3 opacity-40">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <p className="text-[11px] text-zinc-500 italic">No contact details provided.</p>
                </div>
            );
        }

        return (
            <div className="p-6 rounded-2xl border shadow-2xl bg-slate-950/40 backdrop-blur-xl border-indigo-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Verified Contact Info
                        </p>
                    </div>
                    {msg.senderId === currentUserId && (
                        <button
                            onClick={() => revokeMessage(msg.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-all"
                            title="Remove access"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="grid gap-2">
                    {keys.map(key => {
                        let icon = <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />;
                        let label = key;
                        let value = details[key];
                        let href = value;

                        if (key === 'email') {
                            icon = <Mail className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "Email";
                            href = `mailto:${value}`;
                        } else if (key === 'phone') {
                            icon = <Phone className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "Phone";
                            href = `tel:${value}`;
                        } else if (key === 'github') {
                            icon = <Github className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "GitHub";
                            href = value.startsWith('http') ? value : `https://github.com/${value}`;
                        } else if (key === 'linkedin') {
                            icon = <Linkedin className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "LinkedIn";
                            href = value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
                        } else if (key === 'instagram') {
                            icon = <Instagram className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "Instagram";
                            href = value.startsWith('http') ? value : `https://instagram.com/${value}`;
                        } else if (key === 'custom') {
                            icon = <Activity className="w-3.5 h-3.5 text-rose-400" />;
                            label = details[key]?.label || "Link";
                            value = details[key]?.url;
                            href = value;
                        }

                        if (!value) return null;

                        return (
                            
                                key={key}
                                href={getSafeHref(href)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all group/item"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/5 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        {icon}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">
                                            {label}
                                        </p>
                                        <p className="text-[12px] text-white/90 truncate font-medium">
                                            {value}
                                        </p>
                                    </div>
                                </div>
                                <ExternalLink className="w-3 h-3 text-zinc-700 group-hover/item:text-indigo-400 transition-colors" />
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className={`fixed top-[85px] right-0 h-[calc(100vh-85px)] z-[150] shadow-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? "w-[100vw] lg:w-[65%]" : "w-[100vw] lg:w-[440px]"}`}>
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 180 }}
                    className="h-full bg-slate-950/90 border-l border-white/10 flex flex-col backdrop-blur-[50px] overflow-hidden"
                >
                    {/* ── HEADER ── */}
                    <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {partner?.avatarUrl ? (
                                    <img
                                        src={partner.avatarUrl}
                                        alt={partner.name}
                                        className="w-12 h-12 rounded-2xl border border-white/10 object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                {/* Real online/offline indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
                                        isOnline
                                            ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
                                            : "bg-red-500/70"
                                    }`} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-white tracking-tight font-heading">
                                    {partner?.name || "Connecting..."}
                                </h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                                    isOnline ? "text-green-400" : "text-red-400/60"
                                }`}>
                                    {isOnline ? "● Online" : "● Offline"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Expand/collapse desktop only */}
                            <button
                                onClick={() => setIsExpanded(e => !e)}
                                className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all hidden lg:flex"
                            >
                                {isExpanded
                                    ? <Minimize2 className="w-5 h-5" />
                                    : <Maximize2 className="w-5 h-5" />
                                }
                            </button>

                            {/* Three-dot menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(m => !m)}
                                    className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.92, y: -8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.92, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden z-50 py-1.5"
                                        >
                                            {menuActions.map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={action.onClick}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold hover:bg-white/5 transition-all ${action.color}`}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── MESSAGES ── */}
                    <div
                        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                        ref={scrollRef}
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6">
                                    <Lock className="w-7 h-7 text-indigo-400" />
                                </div>
                                <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50 mb-3">
                                    Encrypted Channel
                                </h5>
                                <p className="text-[12px] text-zinc-500 max-w-[200px] leading-relaxed">
                                    All messages are private between you and {partner?.name || "your partner"}.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", damping: 25, delay: Math.min(idx * 0.02, 0.3) }}
                                    className={`flex flex-col ${msg.senderId === currentUserId ? "items-end" : "items-start"}`}
                                >
                                    {msg.senderId === "SYSTEM" ? (
                                        <div className="w-full py-4 flex justify-center items-center relative">
                                            <div className="absolute left-0 right-0 h-px bg-white/5" />
                                            <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 bg-slate-950 px-6 py-2 rounded-full border border-white/5">
                                                {cleanJargon(msg.content)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={`max-w-[85%] space-y-1.5 group ${msg.senderId === currentUserId ? "items-end" : "items-start"}`}>
                                            {msg.type === "TEXT" ? (
                                                <div className={`relative p-4 px-6 rounded-[1.75rem] text-[14px] leading-relaxed font-sans ${
                                                    msg.senderId === currentUserId
                                                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-[0_8px_30px_-8px_rgba(79,70,229,0.4)] ring-1 ring-white/10"
                                                        : "bg-[#0B0F1A]/80 text-white border border-white/[0.06] rounded-tl-sm backdrop-blur-2xl"
                                                }`}>
                                                    {cleanJargon(msg.content)}
                                                    {/* Copy on hover */}
                                                    <button
                                                        onClick={() => copyMessage(msg.content, msg.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700"
                                                    >
                                                        {copiedId === msg.id
                                                            ? <Check className="w-3 h-3 text-green-400" />
                                                            : <Copy className="w-3 h-3 text-zinc-400" />
                                                        }
                                                    </button>
                                                </div>
                                            ) : (
                                                <VerifiedNodeChip msg={msg} />
                                            )}

                                            {/* Timestamp on hover */}
                                            <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-all ${msg.senderId === currentUserId ? "flex-row-reverse" : ""}`}>
                                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className={`w-1 h-1 rounded-full ${msg.senderId === currentUserId ? "bg-indigo-500" : "bg-white/10"}`} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* ── INPUT ── */}
                    <div className="p-6 border-t border-white/5 bg-slate-950/40 backdrop-blur-[80px]">
                        {muted && (
                            <div className="mb-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest text-center">
                                Notifications muted
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-white/[0.02] p-2 pr-3 rounded-[1.75rem] border border-white/[0.06] focus-within:border-indigo-500/50 transition-all">
                            <button
                                onClick={() => setIsBridgeModalOpen(true)}
                                className="p-3.5 bg-white/5 hover:bg-indigo-500/10 rounded-2xl border border-white/5 text-zinc-500 hover:text-indigo-400 transition-all group/plus"
                                title="Share Contact Info"
                            >
                                <Plus className="w-5 h-5 group-hover/plus:rotate-90 transition-transform" />
                            </button>

                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Send a message..."
                                className="flex-1 bg-transparent border-none py-3 text-white text-[14px] placeholder:text-zinc-700 focus:outline-none font-sans"
                            />

                            <button
                                onClick={() => sendMessage()}
                                disabled={!inputText.trim()}
                                className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center transition-all ${
                                    inputText.trim()
                                        ? "bg-white text-black hover:scale-105 active:scale-95 shadow-xl"
                                        : "bg-white/5 text-zinc-800 cursor-not-allowed opacity-20"
                                }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
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
};
