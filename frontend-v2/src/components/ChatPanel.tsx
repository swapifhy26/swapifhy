import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Send, Shield, Trash2, Github, Linkedin, Instagram,
    Phone, Mail, Link as LinkIcon, User, Plus, ExternalLink,
    MoreVertical, Lock, Maximize2, Minimize2, CheckCircle,
    Activity, Copy, Flag, Bell, BellOff, LogOut, Check, Sun, Moon
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

// ── Theme tokens ──────────────────────────────────────────────────────────────
const themes = {
    dark: {
        panelBg: "bg-slate-950/90",
        borderLeft: "border-white/10",
        header: "bg-white/[0.02] border-white/5",
        headerName: "text-white",
        headerSubOnline: "text-green-400",
        headerSubOffline: "text-red-400/60",
        icon: "text-zinc-500 hover:text-white hover:bg-white/5",
        messages: "bg-slate-950",
        emptyIcon: "bg-indigo-500/5 border-indigo-500/10",
        emptyTitle: "text-white/50",
        emptyBody: "text-zinc-500",
        bubbleMine: "bg-indigo-600 text-white shadow-[0_8px_30px_-8px_rgba(79,70,229,0.4)] ring-1 ring-white/10",
        bubblesTheirs: "bg-[#0B0F1A]/80 text-white border border-white/[0.06] backdrop-blur-2xl",
        timestamp: "text-zinc-600",
        systemMsg: "text-zinc-600 bg-slate-950 border-white/5",
        systemLine: "bg-white/5",
        copyBtn: "bg-slate-800 border-white/10 hover:bg-slate-700",
        copyIcon: "text-zinc-400",
        dotMine: "bg-indigo-500",
        dotTheirs: "bg-white/10",
        inputWrapper: "bg-white/[0.02] border-white/[0.06] focus-within:border-indigo-500/50",
        inputText: "text-white placeholder:text-zinc-700",
        plusBtn: "bg-white/5 hover:bg-indigo-500/10 border-white/5 text-zinc-500 hover:text-indigo-400",
        sendActive: "bg-white text-black shadow-xl",
        sendInactive: "bg-white/5 text-zinc-800",
        inputArea: "border-white/5 bg-slate-950/40",
        menu: "bg-slate-900 border-white/10",
        menuHover: "hover:bg-white/5",
        menuDefault: "text-zinc-300",
        mutedBanner: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        avatarFallback: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        onlineDotOn: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse",
        onlineDotOff: "bg-red-500/70",
        onlineDotBg: "bg-slate-950 border-slate-950",
        cardWrapper: "bg-slate-950/40 border-indigo-500/20 backdrop-blur-xl",
        cardItem: "bg-white/[0.02] border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05]",
        cardLabel: "text-zinc-600",
        cardValue: "text-white/90",
        cardIcon: "bg-indigo-500/5",
        cardExternal: "text-zinc-700 group-hover/item:text-indigo-400",
        cardTitle: "text-white",
        revokedCard: "bg-slate-900/10 border-white/5",
        revokedText: "text-zinc-500",
    },
    light: {
        panelBg: "bg-white/98",
        borderLeft: "border-slate-200",
        header: "bg-slate-50 border-slate-100",
        headerName: "text-slate-900",
        headerSubOnline: "text-emerald-600",
        headerSubOffline: "text-slate-400",
        icon: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
        messages: "bg-slate-50",
        emptyIcon: "bg-indigo-50 border-indigo-100",
        emptyTitle: "text-slate-400",
        emptyBody: "text-slate-400",
        bubbleMine: "bg-indigo-600 text-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.35)]",
        bubblesTheirs: "bg-white text-slate-800 border border-slate-200 shadow-sm",
        timestamp: "text-slate-400",
        systemMsg: "text-slate-400 bg-slate-50 border-slate-200",
        systemLine: "bg-slate-200",
        copyBtn: "bg-slate-100 border-slate-200 hover:bg-slate-200",
        copyIcon: "text-slate-500",
        dotMine: "bg-indigo-500",
        dotTheirs: "bg-slate-200",
        inputWrapper: "bg-white border-slate-200 focus-within:border-indigo-400 shadow-sm",
        inputText: "text-slate-800 placeholder:text-slate-400",
        plusBtn: "bg-slate-100 hover:bg-indigo-50 border-slate-200 text-slate-500 hover:text-indigo-500",
        sendActive: "bg-indigo-600 text-white shadow-lg shadow-indigo-200",
        sendInactive: "bg-slate-100 text-slate-300",
        inputArea: "border-slate-100 bg-white/80",
        menu: "bg-white border-slate-200 shadow-xl",
        menuHover: "hover:bg-slate-50",
        menuDefault: "text-slate-600",
        mutedBanner: "bg-amber-50 border-amber-200 text-amber-700",
        avatarFallback: "bg-indigo-50 border-indigo-100 text-indigo-500",
        onlineDotOn: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse",
        onlineDotOff: "bg-slate-300",
        onlineDotBg: "bg-white border-white",
        cardWrapper: "bg-white border-indigo-200 shadow-md",
        cardItem: "bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50",
        cardLabel: "text-slate-400",
        cardValue: "text-slate-800",
        cardIcon: "bg-indigo-50",
        cardExternal: "text-slate-300 group-hover/item:text-indigo-500",
        cardTitle: "text-slate-800",
        revokedCard: "bg-slate-100 border-slate-200",
        revokedText: "text-slate-400",
    }
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
    const [isDark, setIsDark] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const t = isDark ? themes.dark : themes.light;

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
                body: JSON.stringify({ swapId, content: type === "TEXT" ? inputText : null, type, details })
            });
            if (res.ok) { setInputText(""); fetchData(); }
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
            color: t.menuDefault
        },
        {
            icon: isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />,
            label: isExpanded ? "Collapse Chat" : "Expand Chat",
            onClick: () => { setIsExpanded(e => !e); setShowMenu(false); },
            color: t.menuDefault
        },
        {
            icon: <Copy className="w-4 h-4" />,
            label: "Copy Partner Name",
            onClick: () => { if (partner?.name) navigator.clipboard.writeText(partner.name); setShowMenu(false); },
            color: t.menuDefault
        },
        {
            icon: <Flag className="w-4 h-4" />,
            label: "Report User",
            onClick: () => {
                window.open(`mailto:support@swapifhy.com?subject=Report: ${partner?.name}&body=Reporting user ID: ${partner?.id}`, "_blank");
                setShowMenu(false);
            },
            color: "text-red-500"
        },
        {
            icon: <LogOut className="w-4 h-4" />,
            label: "Close Chat",
            onClick: () => { onClose(); setShowMenu(false); },
            color: isDark ? "text-zinc-500" : "text-slate-400"
        },
    ];

    // ── Contact card renderer ──
    const VerifiedNodeChip = ({ msg }: { msg: Message }) => {
        if (msg.isRevoked) {
            return (
                <div className={`p-4 rounded-xl border flex items-center gap-3 opacity-40 ${t.revokedCard}`}>
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <p className={`text-[11px] font-medium italic ${t.revokedText}`}>Access removed.</p>
                </div>
            );
        }

        let details: any = {};
        try {
            details = typeof msg.details === 'string' ? JSON.parse(msg.details) : (msg.details || {});
        } catch { /* malformed */ }

        const keys = Object.keys(details).filter(k => details[k]);

        if (keys.length === 0) {
            return (
                <div className={`p-4 rounded-xl border flex items-center gap-3 opacity-40 ${t.revokedCard}`}>
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <p className={`text-[11px] italic ${t.revokedText}`}>No contact details provided.</p>
                </div>
            );
        }

        return (
            <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${t.cardWrapper}`}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${t.cardTitle}`}>
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
                            label = "Email"; href = `mailto:${value}`;
                        } else if (key === 'phone') {
                            icon = <Phone className="w-3.5 h-3.5 text-indigo-400" />;
                            label = "Phone"; href = `tel:${value}`;
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
                            <a
                                key={key}
                                href={getSafeHref(href)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group/item ${t.cardItem}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform ${t.cardIcon}`}>
                                        {icon}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${t.cardLabel}`}>
                                            {label}
                                        </p>
                                        <p className={`text-[12px] truncate font-medium ${t.cardValue}`}>
                                            {value}
                                        </p>
                                    </div>
                                </div>
                                <ExternalLink className={`w-3 h-3 transition-colors ${t.cardExternal}`} />
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
                    className={`h-full border-l flex flex-col overflow-hidden transition-colors duration-300 backdrop-blur-[50px] ${t.panelBg} ${t.borderLeft}`}
                >
                    {/* ── HEADER ── */}
                    <div className={`px-8 py-5 border-b flex items-center justify-between transition-colors duration-300 ${t.header}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {partner?.avatarUrl ? (
                                    <img src={partner.avatarUrl} alt={partner.name} className="w-12 h-12 rounded-2xl border border-white/10 object-cover" />
                                ) : (
                                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${t.avatarFallback}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 ${t.onlineDotBg}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isOnline ? t.onlineDotOn : t.onlineDotOff}`} />
                                </div>
                            </div>
                            <div>
                                <h4 className={`text-[15px] font-black tracking-tight font-heading ${t.headerName}`}>
                                    {partner?.name || "Connecting..."}
                                </h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isOnline ? t.headerSubOnline : t.headerSubOffline}`}>
                                    {isOnline ? "● Online" : "● Offline"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* ── Light / Dark toggle ── */}
                            <button
                                onClick={() => setIsDark(d => !d)}
                                className={`p-2.5 rounded-xl transition-all ${t.icon}`}
                                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                <motion.div
                                    key={isDark ? "sun" : "moon"}
                                    initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </motion.div>
                            </button>

                            {/* Expand/collapse desktop only */}
                            <button
                                onClick={() => setIsExpanded(e => !e)}
                                className={`p-2.5 rounded-xl transition-all hidden lg:flex ${t.icon}`}
                            >
                                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>

                            {/* Three-dot menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(m => !m)}
                                    className={`p-2.5 rounded-xl transition-all ${t.icon}`}
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
                                            className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-2xl overflow-hidden z-50 py-1.5 ${t.menu}`}
                                        >
                                            {menuActions.map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={action.onClick}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold transition-all ${t.menuHover} ${action.color}`}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={onClose} className={`p-2.5 rounded-xl transition-all ${t.icon}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── MESSAGES ── */}
                    <div
                        className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar transition-colors duration-300 ${t.messages}`}
                        ref={scrollRef}
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                                <div className={`w-16 h-16 rounded-[2rem] border flex items-center justify-center mb-6 ${t.emptyIcon}`}>
                                    <Lock className="w-7 h-7 text-indigo-400" />
                                </div>
                                <h5 className={`text-[11px] font-black uppercase tracking-[0.5em] mb-3 ${t.emptyTitle}`}>
                                    Encrypted Channel
                                </h5>
                                <p className={`text-[12px] max-w-[200px] leading-relaxed ${t.emptyBody}`}>
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
                                            <div className={`absolute left-0 right-0 h-px ${t.systemLine}`} />
                                            <span className={`relative z-10 text-[9px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full border ${t.systemMsg}`}>
                                                {cleanJargon(msg.content)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={`max-w-[85%] space-y-1.5 group ${msg.senderId === currentUserId ? "items-end" : "items-start"}`}>
                                            {msg.type === "TEXT" ? (
                                                <div className={`relative p-4 px-6 rounded-[1.75rem] text-[14px] leading-relaxed font-sans ${
                                                    msg.senderId === currentUserId
                                                        ? `rounded-tr-sm ${t.bubbleMine}`
                                                        : `rounded-tl-sm ${t.bubblesTheirs}`
                                                }`}>
                                                    {cleanJargon(msg.content)}
                                                    <button
                                                        onClick={() => copyMessage(msg.content, msg.id)}
                                                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${t.copyBtn}`}
                                                    >
                                                        {copiedId === msg.id
                                                            ? <Check className="w-3 h-3 text-green-400" />
                                                            : <Copy className={`w-3 h-3 ${t.copyIcon}`} />
                                                        }
                                                    </button>
                                                </div>
                                            ) : (
                                                <VerifiedNodeChip msg={msg} />
                                            )}

                                            <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-all ${msg.senderId === currentUserId ? "flex-row-reverse" : ""}`}>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${t.timestamp}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className={`w-1 h-1 rounded-full ${msg.senderId === currentUserId ? t.dotMine : t.dotTheirs}`} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* ── INPUT ── */}
                    <div className={`p-6 border-t transition-colors duration-300 backdrop-blur-[80px] ${t.inputArea}`}>
                        {muted && (
                            <div className={`mb-3 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center ${t.mutedBanner}`}>
                                Notifications muted
                            </div>
                        )}
                        <div className={`flex items-center gap-3 p-2 pr-3 rounded-[1.75rem] border transition-all duration-300 ${t.inputWrapper}`}>
                            <button
                                onClick={() => setIsBridgeModalOpen(true)}
                                className={`p-3.5 rounded-2xl border transition-all group/plus ${t.plusBtn}`}
                                title="Share Contact Info"
                            >
                                <Plus className="w-5 h-5 group-hover/plus:rotate-90 transition-transform" />
                            </button>

                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Send a message..."
                                className={`flex-1 bg-transparent border-none py-3 text-[14px] focus:outline-none font-sans ${t.inputText}`}
                            />

                            <button
                                onClick={() => sendMessage()}
                                disabled={!inputText.trim()}
                                className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center transition-all ${
                                    inputText.trim()
                                        ? `${t.sendActive} hover:scale-105 active:scale-95`
                                        : `${t.sendInactive} cursor-not-allowed opacity-40`
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
