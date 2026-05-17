import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Zap, MessageSquare } from "lucide-react";
import { useRouter } from "next/router";
import { API_URL } from "../lib/api";
import { ChatPanel } from "../components/ChatPanel";

export default function SwapNetwork() {
    const [view, setView] = useState<"FOLLOWING" | "FOLLOWERS">("FOLLOWING");
    const [networkNodes, setNetworkNodes] = useState<any[]>([]);
    const [stats, setStats] = useState({ followerCount: 0, followingCount: 0 });
    const [loading, setLoading] = useState(true);
    
    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    const router = useRouter();

    const fetchNetwork = async () => {
        setLoading(true);
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }
        
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);

        
        try {
            const endpoint = view === "FOLLOWING" ? "/api/follow/following" : "/api/follow/cloud";
            
            const [nodesRes, statsRes] = await Promise.all([
                fetch(`${API_URL}${endpoint}`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/follow/stats`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const nodesData = await nodesRes.json();
            const statsData = await statsRes.json();

            if (nodesRes.ok) {
                setNetworkNodes(view === "FOLLOWING" ? nodesData.following : nodesData.followers);
            }
            if (statsRes.ok) {
                setStats(statsData);
            }
        } catch (error) {
            console.error("Network sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNetwork();
    }, [view]);

    // Handle unfollow logic directly from the Network Cloud
    const handleUnfollow = async (targetId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            
            await fetch(`${API_URL}/api/follow/sever`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ followingId: targetId })
            });

            // Optimistically shrink the cloud
            setNetworkNodes(prev => prev.filter(n => n.id !== targetId));
            setStats(s => ({ ...s, followingCount: Math.max(0, s.followingCount - 1) }));
        } catch (error) {
            console.error("Failed to sever node", error);
        }
    };

    const handleInitiateSync = async (receiverId: string) => {
        const token = localStorage.getItem("swapifhy_token");
        try {
            const res = await fetch(`${API_URL}/api/chat/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (res.ok && data.swapId) {
                setActiveSwapId(data.swapId);
                setIsChatOpen(true);
            }
        } catch (error) {
            console.error("Sync initiation failed", error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-24">
            <div className="max-w-5xl mx-auto px-6 relative z-10 w-full">
                {/* Header Stratum */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-[40px] font-heading font-extrabold text-foreground tracking-tight mb-3">
                        Your Network
                    </h1>
                    <p className="text-muted-foreground font-medium text-base leading-relaxed max-w-2xl">
                        Manage your skill-swapping matches. Monitor your network and grow your connections.
                    </p>
                </div>

                {/* Telemetry Stat Bar */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                    <div className="bg-surface/30 p-6 md:p-8 flex flex-col justify-center items-start md:items-center rounded-2xl border border-border/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-bl from-foreground to-transparent w-full h-full transform transition-transform group-hover:scale-105" />
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 z-10">Total Followers</h4>
                        <p className="text-4xl md:text-5xl font-black text-foreground relative z-10">{stats.followerCount}</p>
                    </div>
                    <div className="bg-surface/30 p-6 md:p-8 flex flex-col justify-center items-start md:items-center rounded-2xl border border-border/40 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1 z-10">Followings</h4>
                        <p className="text-4xl md:text-5xl font-black text-foreground relative z-10">{stats.followingCount}</p>
                    </div>
                </div>

                {/* Network View Toggles */}
                <div className="flex bg-surface/50 p-1.5 rounded-xl w-full max-w-sm mb-12 border border-border/40 relative shadow-sm">
                    <motion.div 
                        className="absolute top-1.5 bottom-1.5 bg-background shadow-sm border border-border/50 rounded-lg"
                        layoutId="activeNetworkView"
                        initial={false}
                        animate={{ left: view === "FOLLOWING" ? "6px" : "50%", width: "calc(50% - 6px)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button 
                        onClick={() => setView("FOLLOWING")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors relative z-10 ${view === "FOLLOWING" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Following
                    </button>
                    <button 
                        onClick={() => setView("FOLLOWERS")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors relative z-10 ${view === "FOLLOWERS" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Users className="w-3.5 h-3.5" /> Followers
                    </button>
                </div>

                {/* Cloud Node Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-[120px] rounded-2xl bg-surface/30 animate-pulse border border-border/40" />)
                    ) : networkNodes.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-surface/20 rounded-2xl border border-border/30 border-dashed">
                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Connections Yet</h3>
                            <p className="text-sm text-muted-foreground font-medium">Head to the Explore Tab to find new connections.</p>
                        </div>
                    ) : (
                        networkNodes.map((node) => (
                            <motion.div 
                                key={node.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-surface/30 p-5 flex items-center gap-5 rounded-2xl border border-border/40 hover:border-primary/30 transition-all group overflow-hidden shadow-sm"
                            >
                                {/* Mini Avatar */}
                                <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-surface border border-border/80">
                                    {node.avatarUrl ? (
                                        <img src={node.avatarUrl} alt={node.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground font-bold uppercase text-lg">{node.name.charAt(0)}</div>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col min-w-0">
                                    <h3 className="text-[15px] font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors cursor-pointer truncate" onClick={() => router.push(`/explore`)}>{node.name}</h3>
                                    <p className="text-[12px] text-muted-foreground mb-2 truncate">{node.bio || "No professional bio provided."}</p>
                                    
                                    <div className="flex gap-4 mt-2 border-t border-border/40 pt-3">
                                        <button 
                                            onClick={() => handleInitiateSync(node.id)}
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                        >
                                            <MessageSquare className="w-3 h-3" /> Connect Bridge
                                        </button>
                                        
                                        {view === "FOLLOWING" && (
                                            <button 
                                                onClick={() => handleUnfollow(node.id)}
                                                className="text-[10px] font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* CHAT INTERFACE OVERLAY */}
            {isChatOpen && activeSwapId && (
                <ChatPanel 
                    swapId={activeSwapId} 
                    onClose={() => setIsChatOpen(false)} 
                    currentUserId={currentUserId} 
                />
            )}
        </div>
    );
}
