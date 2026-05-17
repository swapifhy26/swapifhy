import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { User, Zap, ArrowRight, MessageSquare, Github, Linkedin, Instagram, Globe, Search, Filter, SlidersHorizontal } from "lucide-react";
import { SwapifhyLogo } from "../components/SwapifhyLogo";
import { ChatPanel } from "../components/ChatPanel";
import { API_URL } from "../lib/api";

export default function Explore() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    
    // Sort and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recommendation"); // recommendation, newest, reputation
    const [filterRole, setFilterRole] = useState("all");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }

        // Fetch current user ID for chat context
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);

        fetch(`${API_URL}/api/match/explore`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if (data.matches) setMatches(data.matches); setLoading(false); })
            .catch(() => setLoading(false));
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

    const Skeleton = () => (
        <div className="flex flex-col gap-10 w-full animate-pulse mt-10">
            <div className="h-16 rounded-2xl glass-elite w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[460px] rounded-[3rem] glass-elite" />
                ))}
            </div>
        </div>
    );

    // Derived State for Filtering/Sorting
    const processedMatches = React.useMemo(() => {
        let result = [...matches];

        // 1. Search Query (Name, Bio, Skills)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.name.toLowerCase().includes(query) || 
                (m.bio && m.bio.toLowerCase().includes(query)) ||
                (m.skillsTeaching && m.skillsTeaching.some((st: any) => st.skill.name.toLowerCase().includes(query))) ||
                (m.skillsLearning && m.skillsLearning.some((sl: any) => sl.skill.name.toLowerCase().includes(query)))
            );
        }

        // 2. Filter Role (Though currently we just use 'all', can expand to 'mentor', 'learner' if backend supports roles later)

        // 3. Sort By
        if (sortBy === "reputation") {
            result.sort((a, b) => b.reputation - a.reputation);
        } else if (sortBy === "newest") {
            // If createdAt exists
            result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }

        return result;
    }, [matches, searchQuery, sortBy, filterRole]);

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden">
            {/* Restored Obsidian Elite Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb orb-blue opacity-10 top-[-10%] left-[-10%]" />
                <div className="mesh-orb orb-pink opacity-5 bottom-[-10%] right-[-10%]" />
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl mx-auto px-6 pb-32 relative z-10 pt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                <div className="space-y-4">
                    {/* <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                            <SwapifhyLogo className="w-8 h-8" />
                        </div>
                        <span className="text-[11px] font-bold text-primary tracking-widest">Intelligence Matrix</span>
                    </div> */}
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight leading-tight">Discover <span className="text-gradient">Users</span></h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed">
                        Discover Users and find matches for yourself in the <span className="text-foreground italic">Swapifhy Hub</span>. 
                    </p>
                </div>
            </div>

            {/* Sync Filters & Search Bar */}
            {!loading && matches.length > 0 && (
                <div className="glass-elite p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between border-primary/20">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search network for skills, interests, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface/50 border border-border/50 text-foreground py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-sans placeholder:text-muted-foreground transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="relative flex-shrink-0">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-surface/50 border border-border/50 text-foreground py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-tech uppercase tracking-wider cursor-pointer hover:bg-surface transition-all"
                            >
                                <option value="recommendation">Recommended</option>
                                <option value="reputation">Highest Rep</option>
                                <option value="newest">Recent Nodes</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                        </div>

                        <div className="relative flex-shrink-0">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select 
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="appearance-none bg-surface/50 border border-border/50 text-foreground py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-tech uppercase tracking-wider cursor-pointer hover:bg-surface transition-all"
                            >
                                <option value="all">All Domains</option>
                                <option value="tech">Technology</option>
                                <option value="design">Design</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <Skeleton /> : matches.length === 0 ? (
                <div className="p-20 rounded-[3.5rem] glass-card border-white/10 text-center shadow-3xl relative overflow-hidden w-full group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-border flex items-center justify-center text-muted/20 mx-auto mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner"><User className="w-12 h-12" /></div>
                    <h3 className="text-3xl font-heading font-black mb-4 text-foreground uppercase tracking-tight italic leading-none">Match <span className="text-primary">Pending</span></h3>
                    <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-[0.3em] max-w-md mx-auto leading-loose opacity-60">
                        Update your bio at the <span className="text-foreground underline decoration-primary/30 underline-offset-4 cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/dashboard")}>Swapifhy Hub</span> to connect with the community.
                    </p>
                </div>
            ) : processedMatches.length === 0 ? (
                <div className="p-16 rounded-[3.5rem] glass-elite text-center w-full">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
                    <h3 className="text-2xl font-heading font-bold mb-2 text-foreground tracking-tight">No Matches Found</h3>
                    <p className="text-muted-foreground font-sans text-sm">We couldn't find anyone matching your current filters.</p>
                    <button onClick={() => {setSearchQuery(""); setSortBy("recommendation");}} className="mt-6 px-6 py-2.5 rounded-xl bg-surface/50 border border-border text-foreground text-xs font-semibold tracking-wide hover:border-primary/50 hover:text-primary transition-all">Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                    {processedMatches.map((m, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 30 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }} 
                            className="p-10 rounded-[3.5rem] glass-elite hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col h-full border hover:-translate-y-3"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-lg"><Zap className="w-3.5 h-3.5" /> High Compatibility</div>
                            </div>

                             <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-border text-foreground flex items-center justify-center text-4xl font-black shadow-inner mb-6 overflow-hidden relative transform group-hover:rotate-3 transition-transform">
                                {m.avatarUrl ? (
                                    <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-heading italic uppercase text-primary/40">{m.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* External Network Bridges */}
                            <div className="flex gap-4 mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
                                {m.github && (
                                    <a href={m.github.startsWith('http') ? m.github : `https://${m.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        <Github className="w-4 h-4" />
                                    </a>
                                )}
                                {m.linkedin && (
                                    <a href={m.linkedin.startsWith('http') ? m.linkedin : `https://${m.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                                {m.instagram && (
                                    <a href={m.instagram.startsWith('http') ? m.instagram : `https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                {m.otherLink && (
                                    <a href={m.otherLink.startsWith('http') ? m.otherLink : `https://${m.otherLink}`} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-heading font-bold mb-2 text-foreground tracking-tight truncate group-hover:text-primary transition-colors">{m.name}</h3>
                            <p className="text-[14px] font-sans text-muted-foreground mb-10 line-clamp-2 min-h-[44px] leading-relaxed opacity-90">{m.bio || "Bio pending update."}</p>

                            <div className="space-y-8 flex-grow">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase opacity-40 mt-1">Obsidian Elite Grade</span>
                                    <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase block mb-2 opacity-60 flex items-center gap-3">
                                        <div className="w-4 h-[1px] bg-primary/40" /> Outbound Expertise
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {m.teaching.length ? m.teaching.map((skill: string, j: number) => (
                                            <span key={j} className="px-5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 transition-all">{skill}</span>
                                        )) : <span className="text-white/10 text-[10px] font-bold italic tracking-widest uppercase ml-4">// Zero Nodes Found</span>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[9px] font-black text-secondary tracking-[0.4em] uppercase block mb-2 opacity-60 flex items-center gap-3">
                                         <div className="w-4 h-[1px] bg-secondary/40" /> Inbound Acquisition
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {m.learning.length ? m.learning.map((skill: string, j: number) => (
                                            <span key={j} className="px-5 py-2 rounded-xl bg-secondary/5 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest hover:border-secondary/50 transition-all">{skill}</span>
                                        )) : <span className="text-white/10 text-[10px] font-bold italic tracking-widest uppercase ml-4">// Zero Nodes Found</span>}
                                    </div>
                                </div>
                            </div>
                            
                             <div className="flex gap-3 mt-10">
                                <button 
                                    className="flex-1 py-3.5 rounded-xl bg-surface/50 border border-border text-[12px] font-semibold tracking-wide hover:bg-surface hover:text-primary transition-all flex items-center justify-center gap-2"
                                    onClick={() => handleFollow(m.id, m.isFollowing)}
                                >
                                    {m.isFollowing ? (
                                        <>Following <div className="w-1.5 h-1.5 rounded-full bg-primary" /></>
                                    ) : (
                                        <>Follow</>
                                    )}
                                </button>
                                <button 
                                    id="sync-btn"
                                    className="flex-[1.5] py-3.5 bg-foreground text-background text-[12px] font-bold group overflow-hidden shadow-md relative rounded-xl hover:scale-[1.02] transition-transform"
                                    onClick={() => handleSync(m.id)}
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        Message <MessageSquare className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                             </div>
                        </motion.div>
                    ))}
                </div>
            )}
            {activeSwapId && (
                <ChatPanel 
                    swapId={activeSwapId} 
                    currentUserId={currentUserId} 
                    onClose={() => setActiveSwapId(null)} 
                />
            )}
            </motion.div>
        </div>
    );
}
