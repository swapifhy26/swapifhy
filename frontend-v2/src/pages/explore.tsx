import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
    User, Zap, MessageSquare, Github, Linkedin, Instagram,
    Globe, Search, Filter, SlidersHorizontal, X
} from "lucide-react";
import { ChatPanel } from "../components/ChatPanel";
import { API_URL } from "../lib/api";

const DOMAIN_OPTIONS = [
    { value: "all", label: "All Domains" },
    { value: "technology", label: "Technology" },
    { value: "design", label: "Design" },
    { value: "music", label: "Music" },
    { value: "languages", label: "Languages" },
    { value: "business", label: "Business" },
    { value: "science", label: "Science" },
    { value: "arts", label: "Arts & Crafts" },
    { value: "fitness", label: "Fitness" },
    { value: "cooking", label: "Cooking" },
    { value: "photography", label: "Photography" },
    { value: "writing", label: "Writing" },
    { value: "general", label: "General" },
];

// ── Swapifhy logo colours: coral #F07060, teal #5BC4C0, blue #6B8FD4 ──
const GLOW_COLORS = ["#5BC4C0", "#6B8FD4", "#F07060", "#5BC4C0"];

// ── Animated border card ──
const GlowCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [hovered, setHovered] = useState(false);
    const [angle, setAngle] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const DURATION = 2400;

    useEffect(() => {
        if (!hovered) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setAngle(0);
            return;
        }
        startRef.current = null;
        const tick = (now: number) => {
            if (!startRef.current) startRef.current = now;
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / DURATION, 1);
            setAngle(progress * 360);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [hovered]);

    const gradient = `conic-gradient(from ${angle}deg at 50% 50%, ${GLOW_COLORS.join(", ")})`;

    return (
        <div
            className={`relative rounded-[3.5rem] ${className ?? ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Glow layer behind the card */}
            <div
                className="absolute inset-0 rounded-[3.5rem] transition-opacity duration-500 pointer-events-none"
                style={{
                    background: gradient,
                    opacity: hovered ? 0.18 : 0,
                    filter: "blur(18px)",
                    transform: "scale(1.04)",
                }}
            />

            {/* Spinning border ring */}
            <div
                className="absolute inset-0 rounded-[3.5rem] pointer-events-none transition-opacity duration-300"
                style={{
                    padding: "1.5px",
                    background: hovered ? gradient : "transparent",
                    opacity: hovered ? 1 : 0,
                    WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />

            {/* Card content */}
            <div className="relative z-10 h-full rounded-[3.5rem] overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default function Explore() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [myTeaching, setMyTeaching] = useState<string[]>([]);
    const [myLearning, setMyLearning] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterDomain, setFilterDomain] = useState("all");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }

        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);

        // ✅ Fetch current user's own skills for match comparison
        fetch(`${API_URL}/api/user/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => {
                if (d.user) {
                    const teach = d.user.teachSkills?.map((s: any) => s.name.toLowerCase()) || [];
                    const learn = d.user.learnSkills?.map((s: any) => s.name.toLowerCase()) || [];
                    setMyTeaching(teach);
                    setMyLearning(learn);
                }
            })
            .catch(() => {});

        fetch(`${API_URL}/api/match/all`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches(data.matches);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ✅ Real skill match: they teach what I want to learn OR they learn what I can teach
    const isSkillMatch = (m: any): boolean => {
        if (myTeaching.length === 0 && myLearning.length === 0) return false;
        const theirTeaching = (m.teaching || []).map((s: string) => s.toLowerCase());
        const theirLearning = (m.learning || []).map((s: string) => s.toLowerCase());
        const theyTeachWhatILearn = theirTeaching.some(s => myLearning.includes(s));
        const theyLearnWhatITeach = theirLearning.some(s => myTeaching.includes(s));
        return theyTeachWhatILearn || theyLearnWhatITeach;
    };

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
            setMatches(prev => prev.map(m =>
                m.id === followingId ? { ...m, isFollowing: !isCurrentlyFollowing } : m
            ));
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

    const processedMatches = React.useMemo(() => {
        let result = [...matches];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(m =>
                m.name?.toLowerCase().includes(q) ||
                m.bio?.toLowerCase().includes(q) ||
                m.hobbies?.toLowerCase().includes(q) ||
                (Array.isArray(m.teaching) && m.teaching.some((s: string) => s.toLowerCase().includes(q))) ||
                (Array.isArray(m.learning) && m.learning.some((s: string) => s.toLowerCase().includes(q)))
            );
        }
        if (filterDomain !== "all") {
            result = result.filter(m => {
                const all = [
                    ...(m.teachingCategories || []),
                    ...(m.learningCategories || []),
                    ...(m.teaching || []),
                    ...(m.learning || [])
                ].map((s: string) => s.toLowerCase());
                return all.some(t => t.includes(filterDomain));
            });
        }
        if (sortBy === "reputation") result.sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0));
        else if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        else if (sortBy === "most_skills") result.sort((a, b) => ((b.teaching?.length ?? 0) + (b.learning?.length ?? 0)) - ((a.teaching?.length ?? 0) + (a.learning?.length ?? 0)));
        return result;
    }, [matches, searchQuery, sortBy, filterDomain]);

    const Skeleton = () => (
        <div className="flex flex-col gap-10 w-full animate-pulse mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-[460px] rounded-[3rem] glass-elite" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb orb-blue opacity-10 top-[-10%] left-[-10%]" />
                <div className="mesh-orb orb-pink opacity-5 bottom-[-10%] right-[-10%]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-7xl mx-auto px-6 pb-32 relative z-10 pt-24"
            >
                {/* Header */}
                <div className="mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight leading-tight">
                        Discover <span className="text-gradient">Users</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed">
                        Find your perfect skill-swap match in the{" "}
                        <span className="text-foreground italic">Swapifhy Hub</span>.
                    </p>
                    {!loading && (
                        <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.3em]">
                            {matches.length} members in the network
                        </p>
                    )}
                </div>

                {/* Filters */}
                {!loading && (
                    <div className="glass-elite p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center border border-primary/10">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, skill, bio, or interest..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground py-3 pl-12 pr-10 rounded-xl focus:outline-none focus:border-primary/50 text-sm placeholder:text-muted-foreground transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative flex-shrink-0">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="appearance-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground py-3 pl-10 pr-8 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-tech uppercase tracking-wider cursor-pointer transition-all">
                                <option value="newest">Newest First</option>
                                <option value="reputation">Highest Rep</option>
                                <option value="most_skills">Most Skills</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                        </div>

                        <div className="relative flex-shrink-0">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                                className="appearance-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground py-3 pl-10 pr-8 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-tech uppercase tracking-wider cursor-pointer transition-all">
                                {DOMAIN_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                        </div>

                        {(searchQuery || filterDomain !== "all" || sortBy !== "newest") && (
                            <button
                                onClick={() => { setSearchQuery(""); setFilterDomain("all"); setSortBy("newest"); }}
                                className="flex-shrink-0 px-4 py-3 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2"
                            >
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Results count */}
                {!loading && matches.length > 0 && (
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mb-8">
                        Showing {processedMatches.length} of {matches.length} members
                        {searchQuery && <span> for "<span className="text-primary">{searchQuery}</span>"</span>}
                        {filterDomain !== "all" && <span> in <span className="text-secondary capitalize">{filterDomain}</span></span>}
                    </p>
                )}

                {/* Content */}
                {loading ? (
                    <Skeleton />
                ) : matches.length === 0 ? (
                    <div className="p-20 rounded-[3.5rem] glass-card text-center relative overflow-hidden w-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-10">
                            <User className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-3xl font-heading font-black mb-4 text-foreground uppercase tracking-tight italic">
                            No Members <span className="text-primary">Yet</span>
                        </h3>
                    </div>
                ) : processedMatches.length === 0 ? (
                    <div className="p-16 rounded-[3.5rem] glass-elite text-center w-full">
                        <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
                        <h3 className="text-2xl font-heading font-bold mb-2 text-foreground">No Results Found</h3>
                        <p className="text-muted-foreground text-sm mb-8">Try a different keyword, skill name, or domain.</p>
                        <button onClick={() => { setSearchQuery(""); setFilterDomain("all"); setSortBy("newest"); }}
                            className="px-6 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:text-primary transition-all">
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                        {processedMatches.map((m, i) => {
                            const matched = isSkillMatch(m);
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                    className="h-full"
                                >
                                    <GlowCard className="h-full">
                                        <div className="p-10 rounded-[3.5rem] glass-elite flex flex-col h-full group relative">

                                            {/* ✅ Skill Match badge — ONLY shown when skills actually match */}
                                            {matched && (
                                                <div className="absolute top-6 right-6 z-20">
                                                    <div className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
                                                        style={{
                                                            background: "linear-gradient(135deg, rgba(91,196,192,0.15), rgba(107,143,212,0.15))",
                                                            border: "1px solid rgba(91,196,192,0.4)",
                                                            color: "#5BC4C0",
                                                            backdropFilter: "blur(8px)"
                                                        }}>
                                                        <Zap className="w-3.5 h-3.5" /> Skill Match
                                                    </div>
                                                </div>
                                            )}

                                            {/* Avatar */}
                                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-border flex items-center justify-center shadow-inner mb-6 overflow-hidden transform group-hover:rotate-3 transition-transform">
                                                {m.avatarUrl ? (
                                                    <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-heading italic uppercase text-primary/40 text-4xl font-black">
                                                        {m.name?.charAt(0) ?? "?"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Social links */}
                                            <div className="flex gap-4 mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {m.github && <a href={m.github.startsWith('http') ? m.github : `https://${m.github}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors"><Github className="w-4 h-4" /></a>}
                                                {m.linkedin && <a href={m.linkedin.startsWith('http') ? m.linkedin : `https://${m.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>}
                                                {m.instagram && <a href={m.instagram.startsWith('http') ? m.instagram : `https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors"><Instagram className="w-4 h-4" /></a>}
                                                {m.otherLink && <a href={m.otherLink.startsWith('http') ? m.otherLink : `https://${m.otherLink}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-secondary transition-colors"><Globe className="w-4 h-4" /></a>}
                                            </div>

                                            {/* Name & bio */}
                                            <h3 className="text-2xl font-heading font-bold mb-2 text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                                                {m.name}
                                            </h3>
                                            <p className="text-[13px] text-muted-foreground mb-8 line-clamp-2 min-h-[40px] leading-relaxed">
                                                {m.bio || "Bio pending update."}
                                            </p>

                                            {/* Skills */}
                                            <div className="space-y-6 flex-grow">
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-primary tracking-[0.4em] uppercase opacity-70 flex items-center gap-2">
                                                        <span className="w-4 h-[1px] bg-primary/40 inline-block" /> Teaching
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {m.teaching && m.teaching.length > 0 ? (
                                                            m.teaching.slice(0, 4).map((skill: string, j: number) => (
                                                                <span key={j} className="px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 transition-all">
                                                                    {skill}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground/40 text-[10px] italic">Not specified</span>
                                                        )}
                                                        {m.teaching && m.teaching.length > 4 && (
                                                            <span className="px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary/50 text-[10px] font-bold">+{m.teaching.length - 4}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-secondary tracking-[0.4em] uppercase opacity-70 flex items-center gap-2">
                                                        <span className="w-4 h-[1px] bg-secondary/40 inline-block" /> Learning
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {m.learning && m.learning.length > 0 ? (
                                                            m.learning.slice(0, 4).map((skill: string, j: number) => (
                                                                <span key={j} className="px-4 py-1.5 rounded-xl bg-secondary/5 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest hover:border-secondary/50 transition-all">
                                                                    {skill}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground/40 text-[10px] italic">Not specified</span>
                                                        )}
                                                        {m.learning && m.learning.length > 4 && (
                                                            <span className="px-4 py-1.5 rounded-xl bg-secondary/5 border border-secondary/10 text-secondary/50 text-[10px] font-bold">+{m.learning.length - 4}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 mt-10">
                                                <button
                                                    className="flex-1 py-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground text-[12px] font-semibold hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                                                    onClick={() => handleFollow(m.id, m.isFollowing)}
                                                >
                                                    {m.isFollowing
                                                        ? <><span>Following</span><div className="w-1.5 h-1.5 rounded-full bg-primary" /></>
                                                        : "Follow"
                                                    }
                                                </button>

                                                {/* ✅ Message button — always visible, themed colour */}
                                                <button
                                                    className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:scale-[1.02] shadow-lg"
                                                    style={{
                                                        background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)",
                                                        color: "#fff",
                                                        boxShadow: "0 4px 20px rgba(91,196,192,0.25)"
                                                    }}
                                                    onClick={() => handleSync(m.id)}
                                                >
                                                    Message
                                                    <MessageSquare className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlowCard>
                                </motion.div>
                            );
                        })}
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
