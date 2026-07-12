import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, User, Zap, Search, Clock, Wifi, WifiOff, Users } from "lucide-react";
import { API_URL } from "../lib/api";

interface Conversation {
    swapId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    isOnline?: boolean;
    lastMessage: string;
    status: string;
    updatedAt: string;
}

interface ChatListPanelProps {
    onClose: () => void;
    onSelectChat: (swapId: string) => void;
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

type FilterMode = "ALL" | "ONLINE" | "OFFLINE";

export const ChatListPanel = ({ onClose, onSelectChat, currentUserId }: ChatListPanelProps) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<FilterMode>("ALL");

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.conversations) {
                setConversations(data.conversations);
            }
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const onlineCount = conversations.filter(c => c.isOnline).length;
    const offlineCount = conversations.filter(c => !c.isOnline).length;

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === "ALL" ? true :
            filter === "ONLINE" ? c.isOnline :
            !c.isOnline;
        return matchesSearch && matchesFilter;
    });

    const filters: { mode: FilterMode; label: string; count: number; dot?: string }[] = [
        { mode: "ALL", label: "All", count: conversations.length },
        { mode: "ONLINE", label: "Online", count: onlineCount, dot: "bg-green-500" },
        { mode: "OFFLINE", label: "Offline", count: offlineCount, dot: "bg-zinc-600" },
    ];

    return (
        <AnimatePresence>
            <div className="fixed top-[85px] right-0 h-[calc(100vh-85px)] w-[100vw] lg:w-[380px] z-[160] shadow-3xl">
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 180 }}
                    className="h-full bg-slate-950/95 border-l border-white/10 flex flex-col shadow-3xl backdrop-blur-[40px] overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-white uppercase tracking-widest font-heading leading-none">Swap Hub</h4>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                    <span className="text-green-400">{onlineCount} online</span>
                                    <span className="mx-1.5 opacity-30">·</span>
                                    {offlineCount} offline
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-4 pt-4 pb-3 border-b border-white/5">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/40 transition-all"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-1.5">
                            {filters.map(({ mode, label, count, dot }) => (
                                <button
                                    key={mode}
                                    onClick={() => setFilter(mode)}
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === mode
                                            ? "bg-white/10 text-white border border-white/10"
                                            : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5 border border-transparent"
                                    }`}
                                >
                                    {dot && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${dot} ${mode === "ONLINE" ? "shadow-[0_0_6px_rgba(34,197,94,0.8)]" : ""}`} />
                                    )}
                                    {mode === "ALL" && <Users className="w-3 h-3" />}
                                    {label}
                                    <span className={`ml-0.5 text-[9px] ${filter === mode ? "text-zinc-400" : "text-zinc-700"}`}>
                                        {count}
                                    </span>
                                    {filter === mode && (
                                        <motion.div
                                            layoutId="filterUnderline"
                                            className="absolute bottom-0 left-2 right-2 h-px bg-primary/60 rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center opacity-40">
                                <Zap className="w-6 h-6 text-indigo-400 animate-pulse mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Connecting...</p>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-12 text-center opacity-40">
                                {filter === "ONLINE" ? (
                                    <>
                                        <Wifi className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">No one online right now</p>
                                    </>
                                ) : filter === "OFFLINE" ? (
                                    <>
                                        <WifiOff className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">No offline contacts</p>
                                    </>
                                ) : (
                                    <>
                                        <User className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">No Active Swaps</p>
                                        <p className="text-[10px] text-zinc-600 mt-2 font-medium">Start a swap from the Explore or Feed sections.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredConversations.map((conv) => (
                                    <motion.button
                                        key={conv.swapId}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => onSelectChat(conv.swapId)}
                                        className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group text-left"
                                    >
                                        <div className="relative shrink-0">
                                            {conv.partnerAvatar ? (
                                                <img src={conv.partnerAvatar} alt={conv.partnerName} className="w-12 h-12 rounded-[1.25rem] border border-white/10 object-cover shadow-lg" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                            {/* Online/offline dot */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950">
                                                {conv.isOnline ? (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse" />
                                                ) : (
                                                    <div className="w-2 h-2 bg-zinc-600 rounded-full" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h5 className="text-[14px] font-bold text-white group-hover:text-primary transition-colors truncate">
                                                        {conv.partnerName}
                                                    </h5>
                                                    {conv.isOnline && (
                                                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest shrink-0">online</span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter flex items-center gap-1.5 shrink-0 ml-2">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                                                {cleanJargon(conv.lastMessage)}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 opacity-30">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 text-center">Swapifhy Platform</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
