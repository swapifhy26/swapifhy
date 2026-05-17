import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Zap, ArrowRight, MessageSquare, User, Github, Linkedin, Instagram, Globe } from "lucide-react";
import { SwapifhyLogo } from "../components/SwapifhyLogo";
import { ChatPanel } from "../components/ChatPanel";
import { useRouter } from "next/router";
import { API_URL } from "../lib/api";

export default function MatchMatrix() {
    const [matches, setMatches] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const router = useRouter();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }
        
        hasFetched.current = true;
        console.log("[MatchMatrix] Initializing Matching System...");

        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);

        const fetchMatches = fetch(`${API_URL}/api/match/sync-matrix`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
        const fetchConvs = fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());

        Promise.all([fetchMatches, fetchConvs])
            .then(([matchData, chatData]) => {
                if (matchData.matches) setMatches(matchData.matches);
                if (chatData.conversations) setConversations(chatData.conversations);
                setLoading(false);
            })
            .catch((err) => {
                console.error("[MatchMatrix] System Failure:", err);
                setLoading(false);
            });
    }, []);

    const handleFollow = async (followingId: string, isCurrentlyFollowing: boolean) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
                const method = isCurrentlyFollowing ? "DELETE" : "POST";
            const endpoint = isCurrentlyFollowing ? "/api/follow/sever" : "/api/follow/sync";
            
            await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ followingId })
            });

            // Optimistic UI Update
            setMatches(prev => prev.map(m => m.id === followingId ? { ...m, isFollowing: !isCurrentlyFollowing } : m));
        } catch (err) { console.error(err); }
    };

    const handleSync = async (receiverId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
                const res = await fetch(`${API_URL}/api/chat/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (data.swapId) setActiveSwapId(data.swapId);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden flex flex-col p-6 pt-32">
            {/* Obsidian Elite Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb orb-blue opacity-10 top-[-10%] left-[-10%]" />
                <div className="mesh-orb orb-pink opacity-5 bottom-[-10%] right-[-10%]" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.4em]">Connected</span>
                            <span className="text-muted-foreground text-[8px] font-black uppercase tracking-[0.4em] opacity-40">// System Operational</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight leading-none">
                            Your <span className="text-gradient">Matches</span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Potential Synergy Nodes */}
                    <div className="lg:col-span-3 space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-bold text-muted-foreground tracking-wide flex items-center gap-3">
                                <Sparkles className="text-primary w-4 h-4" /> Potential Matches
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                                {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-[3rem] glass-elite" />)}
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {matches.map((m, i) => (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={i} className="p-10 rounded-[3rem] glass-elite hover:border-primary/30 transition-all group flex flex-col">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-20 h-20 rounded-[1.5rem] bg-surface border border-border overflow-hidden p-0.5">
                                                {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover rounded-[1.3rem]" /> : <div className="w-full h-full flex items-center justify-center font-black text-xl italic text-primary/40 bg-primary/5">{m.name?.charAt(0) || "U"}</div>}
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                {m.github && <a href={m.github} target="_blank" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all"><Github className="w-4 h-4" /></a>}
                                                {m.linkedin && <a href={m.linkedin} target="_blank" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all"><Linkedin className="w-4 h-4" /></a>}
                                                {m.instagram && <a href={m.instagram} target="_blank" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all"><Instagram className="w-4 h-4" /></a>}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-heading font-bold text-foreground tracking-tight mb-2 truncate">{m.name}</h3>
                                        <p className="text-[13px] font-sans text-muted-foreground mb-8 line-clamp-2 h-8 leading-relaxed opacity-90">{m.bio || "No manual signature detected."}</p>
                                        <div className="flex flex-wrap gap-2 mb-10 min-h-[30px]">
                                            {m.teaching?.slice(0, 2).map((s: any, j: any) => (
                                                <span key={j} className="px-3 py-1 rounded-lg bg-primary/5 border border-primary/20 text-primary font-black text-[8px] uppercase tracking-widest">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-auto">
                                            <button 
                                                className="flex-1 py-3.5 rounded-xl bg-surface/50 border border-border text-[12px] font-semibold tracking-wide hover:bg-surface hover:text-primary transition-all flex items-center justify-center gap-2"
                                                onClick={() => handleFollow(m.id, m.isFollowing)}
                                            >
                                                {m.isFollowing ? "Following" : "Follow"}
                                            </button>
                                            <button 
                                                onClick={() => handleSync(m.id)} 
                                                className="flex-[1.5] py-3.5 rounded-xl bg-foreground text-background text-[12px] font-bold group overflow-hidden shadow-md relative hover:scale-[1.02] transition-transform"
                                            >
                                                <span className="relative z-10 flex items-center justify-center">
                                                    Message <MessageSquare className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-20"><p className="text-xs font-black uppercase tracking-[0.5em]">No matches found in your area.</p></div>
                        )}
                    </div>

                    {/* Active Sync Sessions (Inbox) */}
                    <div className="space-y-12 h-fit lg:sticky lg:top-32">
                        <h2 className="text-[13px] font-bold text-muted-foreground tracking-wide flex items-center gap-3">
                            <MessageSquare className="text-secondary w-4 h-4" /> Active Chats
                        </h2>
                        
                        <div className="space-y-4">
                            {conversations.length > 0 ? (
                                conversations.map((conv, idx) => (
                                    <motion.div onClick={() => setActiveSwapId(conv.swapId)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="p-6 rounded-[2rem] glass-elite hover:border-secondary/40 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-surface border border-border overflow-hidden">
                                                {conv.partnerAvatar ? <img src={conv.partnerAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs bg-secondary/10 text-secondary">{conv.partnerName?.charAt(0) || "U"}</div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[13px] font-bold text-foreground tracking-tight truncate mb-0.5">{conv.partnerName}</h4>
                                                <p className="text-[12px] text-muted-foreground truncate opacity-80">{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-10 border border-white/5 rounded-[2rem] text-center opacity-20">
                                    <p className="text-[8px] font-black uppercase tracking-widest leading-loose">No active chats. Message someone to start swapping.</p>
                                </div>
                            )}
                        </div>

                        {/* Efficiency Stats */}
                        <div className="p-8 rounded-[2rem] bg-secondary/5 border border-secondary/10 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black text-secondary uppercase tracking-[0.3em]">Network Status</span>
                                <span className="text-secondary font-black text-xs animate-pulse">ACTIVE</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {activeSwapId && (
                <ChatPanel 
                    swapId={activeSwapId} 
                    currentUserId={currentUserId} 
                    onClose={() => setActiveSwapId(null)} 
                />
            )}
        </div>
    );
}
