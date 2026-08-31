import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, BookOpen, Users, Star, Award, Clock, ArrowUpRight, CheckCircle2, Zap, MessageSquare, Lock, Link as LinkIcon, Calendar, FileText, Check, X, AlertTriangle } from "lucide-react";
import { API_URL } from "../lib/api";

const BADGE_DEFINITIONS = [
    { id: "early_bird", name: "Early Bird", description: "Complete your first swap", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500", check: (s: any) => s.totalSwaps >= 1 },
    { id: "dedicated_learner", name: "Dedicated Learner", description: "Learn for 10+ hours", icon: <BookOpen className="w-5 h-5" />, color: "bg-primary", check: (s: any) => s.hoursLearned >= 10 },
    { id: "master_mentor", name: "Master Mentor", description: "Teach 5+ students", icon: <Award className="w-5 h-5" />, color: "bg-rose-500", check: (s: any) => s.studentsTaught >= 5 },
    { id: "top_rated", name: "Top Rated", description: "Maintain a 4.8+ avg rating", icon: <Star className="w-5 h-5" />, color: "bg-teal-500", check: (s: any) => s.avgRating >= 4.8 },
    
    // STREAK BADGES
    { id: "streak_1", name: "First Spark", description: "1-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-orange-400", check: (s: any) => s.highestStreak >= 1 },
    { id: "streak_7", name: "Weekly Warrior", description: "7-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-orange-500", check: (s: any) => s.highestStreak >= 7 },
    { id: "streak_30", name: "Monthly Master", description: "30-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-red-500", check: (s: any) => s.highestStreak >= 30 },
    { id: "streak_60", name: "Sixty-Day Sage", description: "60-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-rose-500", check: (s: any) => s.highestStreak >= 60 },
    { id: "streak_90", name: "Quarterly Quest", description: "90-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-pink-500", check: (s: any) => s.highestStreak >= 90 },
    { id: "streak_100", name: "Century Club", description: "100-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-purple-500", check: (s: any) => s.highestStreak >= 100 },
    { id: "streak_120", name: "Relentless", description: "120-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-violet-500", check: (s: any) => s.highestStreak >= 120 },
    { id: "streak_160", name: "Unstoppable", description: "160-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-indigo-500", check: (s: any) => s.highestStreak >= 160 },
    { id: "streak_200", name: "Legendary Flame", description: "200-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-slate-900", check: (s: any) => s.highestStreak >= 200 }
];

export default function Progress() {
    const [activeTab, setActiveTab] = useState<"overview" | "learning" | "teaching">("overview");
    const [stats, setStats] = useState({ totalSwaps: 0, hoursLearned: 0, hoursTaught: 0, avgRating: 0, studentsTaught: 0, currentStreak: 0, highestStreak: 0, xp: 0 });
    const [incomingSwaps, setIncomingSwaps] = useState<any[]>([]);
    const [outgoingSwaps, setOutgoingSwaps] = useState<any[]>([]);
    const [learning, setLearning] = useState<any[]>([]);
    const [teaching, setTeaching] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [token, setToken] = useState<string>("");
    
    // Modal state
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeMentorship, setActiveMentorship] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const fetchData = async () => {
        const t = localStorage.getItem("swapifhy_token");
        if (!t) return;
        setToken(t);
        
        try {
            const [profRes, reqRes, mentRes] = await Promise.all([
                fetch(`${API_URL}/api/user/profile`, { headers: { "Authorization": `Bearer ${t}` } }),
                fetch(`${API_URL}/api/mentorships/requests`, { headers: { "Authorization": `Bearer ${t}` } }),
                fetch(`${API_URL}/api/mentorships`, { headers: { "Authorization": `Bearer ${t}` } })
            ]);
            
            const profData = await profRes.json();
            const reqData = await reqRes.json();
            const mentData = await mentRes.json();
            
            if (profData.user) {
                setStats({
                    totalSwaps: profData.user.totalSwaps ?? profData.user.reputation ?? 0,
                    hoursLearned: profData.user.hoursLearned ?? 0,
                    hoursTaught: profData.user.hoursTaught ?? 0,
                    avgRating: profData.user.avgRating ?? 0,
                    studentsTaught: mentData.teaching?.length || 0,
                    currentStreak: profData.user.currentStreak ?? 0,
                    highestStreak: profData.user.highestStreak ?? 0,
                    xp: profData.user.xp ?? 0
                });
            }
            if (reqData.incoming) setIncomingSwaps(reqData.incoming);
            if (reqData.outgoing) setOutgoingSwaps(reqData.outgoing);
            if (mentData.learning) setLearning(mentData.learning);
            if (mentData.teaching) setTeaching(mentData.teaching);
        } catch (e) {
            console.error("Failed to load hub data", e);
        }
        setLoaded(true);
    };

    useEffect(() => { fetchData(); }, []);

    
    const handleRevokeSwap = async (swapId: string) => {
        if (!confirm("Are you sure you want to revoke this swap request?")) return;
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/chat/swap/${swapId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            } else {
                const d = await res.json();
                alert(d.error || "Failed to revoke");
            }
        } catch (err) { console.error(err); }
    };

    const acceptSwap = async (id: string) => {
        const res = await fetch(`${API_URL}/api/mentorships/${id}/accept`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) fetchData();
        else { const d = await res.json(); alert(d.error || "Failed to accept swap"); }
    };

    const actionMentorship = async (url: string, method: string, body?: any) => {
        const res = await fetch(`${API_URL}${url}`, {
            method,
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined
        });
        if (res.ok) { setActiveModal(null); fetchData(); }
        else { const d = await res.json(); alert(d.error || "Action failed"); }
    };

    const calculateProgress = (m: any) => {
        if (!m) return 0;
        const totalAssignments = m.assignments?.length || 0;
        const completedAssignments = m.assignments?.filter((a:any) => a.isCompleted).length || 0;
        const assignFactor = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 50 : 0;
        
        const completedClasses = m.classes?.filter((c:any) => c.isCompleted) || [];
        const completedHours = completedClasses.reduce((acc:number, c:any) => acc + (c.durationMinutes / 60), 0);
        const hoursFactor = m.targetDurationHours > 0 ? Math.min((completedHours / m.targetDurationHours) * 50, 50) : 0;
        
        return Math.round(assignFactor + hoursFactor);
    };

    if (!loaded) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-36 md:pb-24 selection:bg-primary/20">
            <Head><title>Progress & Learning Hub - Swapifhy</title></Head>

            {/* Dynamic Ambient Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className={`mesh-orb transition-all duration-1000 absolute top-[-10%] left-[-10%] ${
                    activeTab === "learning" ? "bg-teal-500/15 scale-125 blur-[140px]" : 
                    activeTab === "teaching" ? "bg-rose-500/5 scale-90 blur-[100px]" : "orb-blue opacity-10"
                }`} />
                <div className={`mesh-orb transition-all duration-1000 absolute bottom-[-10%] right-[-10%] ${
                    activeTab === "learning" ? "bg-teal-500/5 scale-90 blur-[100px]" : 
                    activeTab === "teaching" ? "bg-rose-500/15 scale-125 blur-[140px]" : "orb-pink opacity-5"
                }`} />
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 w-full">
                
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight mb-4">
                        Your <span className={`transition-colors duration-500 ${
                            activeTab === "learning" ? "text-teal-500" : activeTab === "teaching" ? "text-rose-500" : "text-primary"
                        }`}>Progress</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
                        Track milestones, schedule classes, and manage swaps.
                    </p>
                </div>


                
                {/* 🌟 LEVELING SYSTEM (XP BAR) */}
                <div className="relative glass-card border border-border/50 rounded-[2.5rem] p-6 lg:p-10 mb-6 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative flex items-center gap-6 w-full md:w-auto">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)] border-4 border-yellow-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-900/80 mb-[-4px]">Level</span>
                            <span className="text-4xl lg:text-5xl font-black text-yellow-950 drop-shadow-sm">{Math.floor(stats.xp / 1000) + 1}</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">
                                {stats.xp >= 1000 ? "Elite Scholar!" : "Keep Grinding!"}
                            </h2>
                            <p className="text-muted-foreground font-sans text-sm lg:text-base font-medium">
                                Earn XP by completing swaps and helping others.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Current XP</span>
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">{stats.xp} / { (Math.floor(stats.xp / 1000) + 1) * 1000 } XP</span>
                        </div>
                        <div className="relative h-4 rounded-full bg-muted overflow-hidden mb-3 border border-border/50 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.xp % 1000) / 10}%` }} 
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                            >
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                            <span className="text-amber-500">Level {Math.floor(stats.xp / 1000) + 1}</span>
                            <span>Level {Math.floor(stats.xp / 1000) + 2}</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 DUOLINGO-STYLE STREAK BAR */}
                <div className="relative glass-card border border-border/50 rounded-[2.5rem] p-6 lg:p-10 mb-12 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative flex items-center gap-6">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse">
                            <span className="text-4xl lg:text-5xl drop-shadow-md">🔥</span>
                        </div>
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">
                                {stats.currentStreak}-Day Streak!
                            </h2>
                            <p className="text-muted-foreground font-sans text-sm lg:text-base font-medium">
                                Come back tomorrow to keep your flame alive.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Rewards Progress</span>
                            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">Next: Pro Badge (7 Days)</span>
                        </div>
                        <div className="relative h-4 rounded-full bg-muted overflow-hidden mb-3 border border-border/50 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((stats.currentStreak / 7) * 100, 100)}%` }} 
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                            >
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20 mix-blend-overlay"></div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                            <span className="text-orange-500">Day 1</span>
                            <span className="text-orange-500">Day {stats.currentStreak} (You)</span>
                            <span>Day 7</span>
                        </div>
                    </div>
                </div>

                {/* Tab Toggle */}

                <div className="flex bg-surface/50 p-1.5 rounded-2xl w-full max-w-md mb-12 border border-border/40 relative shadow-sm backdrop-blur-xl">
                    <motion.div
                        className="absolute top-1.5 bottom-1.5 bg-background shadow-md border border-border/50 rounded-xl"
                        layoutId="activeProgressTab"
                        initial={false}
                        animate={{
                            left: activeTab === "overview" ? "6px" : activeTab === "learning" ? "33.33%" : "66.66%",
                            width: "calc(33.33% - 8px)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    {(["overview", "learning", "teaching"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 capitalize ${
                                activeTab === tab 
                                    ? tab === "learning" ? "text-teal-500" : tab === "teaching" ? "text-rose-500" : "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* OVERVIEW */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: "Total Swaps", value: stats.totalSwaps, icon: <Users className="w-5 h-5 text-primary" />, bg: "bg-primary/10" },
                                    { label: "Hours Learned", value: stats.hoursLearned, icon: <Clock className="w-5 h-5 text-teal-500" />, bg: "bg-teal-500/10" },
                                    { label: "Hours Taught", value: stats.hoursTaught, icon: <BookOpen className="w-5 h-5 text-rose-500" />, bg: "bg-rose-500/10" },
                                    { label: "Avg Rating", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", icon: <Star className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" }
                                ].map((stat, i) => (
                                    <div key={i} className="glass-elite p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</h4>
                                        <p className="text-4xl font-black text-foreground">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

{/* Achievements & Badges Grid */}
                            <div className="glass-elite p-8 rounded-3xl mt-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" /> Achievements & Badges
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {BADGE_DEFINITIONS.map(badge => {
                                        const isUnlocked = badge.check(stats);
                                        return (
                                            <div key={badge.id} className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? "bg-background/80 border border-border/50 shadow-lg hover:scale-105" : "bg-background/20 border border-border/20 opacity-50 grayscale hover:opacity-70"}`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner ${isUnlocked ? badge.color + " text-white shadow-[0_0_15px_currentColor]" : "bg-muted text-muted-foreground"}`}>
                                                    {badge.icon}
                                                </div>
                                                <p className="font-bold text-sm mb-1 leading-tight">{badge.name}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground leading-tight">{badge.description}</p>
                                                {isUnlocked && <span className="mt-3 text-[9px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-sm">Unlocked</span>}
                                                {!isUnlocked && <span className="mt-3 text-[9px] font-black tracking-widest uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm"><Lock className="w-2 h-2 inline mr-1" />Locked</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Swap Requests Bar */}
                            <div className="glass-elite p-8 rounded-3xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Swap Requests (Incoming)</h3>
                                {incomingSwaps.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {incomingSwaps.map(req => (
                                            <div key={req.id} className="p-4 bg-background/50 rounded-2xl border border-border/50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={req.proposer.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${req.proposer.name}`} className="w-10 h-10 rounded-full bg-muted" alt="" />
                                                    <div>
                                                        <p className="font-bold text-sm">{req.proposer.name}</p>
                                                        <p className="text-xs text-muted-foreground">Wants to swap with you</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => acceptSwap(req.id)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Accept
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No incoming requests right now.</p>}
                            </div>

                            {/* Swap Sent Bar */}
                            <div className="glass-elite p-8 rounded-3xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-teal-500" /> Swaps Sent (Outgoing)</h3>
                                <p className="text-xs text-muted-foreground mb-4">You can send up to 5 requests at a time. ({outgoingSwaps.length}/5)</p>
                                {outgoingSwaps.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {outgoingSwaps.map(req => (
                                            <div key={req.id} className="p-4 bg-background/50 rounded-2xl border border-border/50 flex items-center justify-between opacity-70">
                                                <div className="flex items-center gap-3">
                                                    <img src={req.receiver.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${req.receiver.name}`} className="w-10 h-10 rounded-full bg-muted" alt="" />
                                                    <div>
                                                        <p className="font-bold text-sm">{req.receiver.name}</p>
                                                        <p className="text-xs text-muted-foreground">Pending their approval</p>
                                                    </div>
                                                </div>

                                                    <button onClick={() => handleRevokeSwap(req.id)} className="px-3 py-1.5 bg-red-900/50 text-red-200 text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">
                                                        Revoke
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">You haven't sent any swap requests yet.</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* LEARNING HUB */}
                    {activeTab === "learning" && (
                        <motion.div key="learning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                            {learning.length > 0 ? learning.map(m => {
                                const prog = calculateProgress(m);
                                return (
                                    <div key={m.id} className="glass-elite p-8 rounded-3xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <span className="text-[11px] font-bold tracking-widest text-teal-500 uppercase mb-2 block">Ongoing Learning</span>
                                                <h2 className="text-3xl font-bold font-display mb-1">{m.skill.name}</h2>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">Teacher: <span className="font-semibold text-foreground">{m.teacher.name}</span></p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center"><BookOpen className="w-6 h-6 text-teal-500" /></div>
                                        </div>

                                        <div className="mb-6 relative z-10">
                                            <div className="flex justify-between text-xs font-bold mb-2"><span className="text-muted-foreground uppercase tracking-wider">Progress</span><span className="text-teal-500">{prog}%</span></div>
                                            <div className="h-2 bg-surface/50 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${prog}%` }} /></div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 relative z-10">
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Target Hours</p><p className="font-bold text-lg">{m.targetDurationHours || 0}h</p></div>
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Classes</p><p className="font-bold text-lg">{m.classes?.length || 0}</p></div>
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Assignments</p><p className="font-bold text-lg">{m.assignments?.length || 0}</p></div>
                                            <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20"><p className="text-[10px] uppercase font-bold text-teal-500 tracking-widest mb-1">Status</p><p className="font-bold text-lg text-teal-500">{m.status}</p></div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 relative z-10">
                                            {m.meetingLink && <a href={m.meetingLink} target="_blank" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Join Class</a>}
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("rate"); }} className="px-4 py-2 bg-surface/50 border border-border/40 hover:bg-muted text-sm font-bold rounded-xl flex items-center gap-2"><Star className="w-4 h-4 text-amber-500"/> Rate Teacher</button>
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("leave"); }} className="px-4 py-2 bg-surface/50 border border-border/40 hover:bg-muted text-sm font-bold rounded-xl flex items-center gap-2 text-red-500"><AlertTriangle className="w-4 h-4"/> Leave Swap</button>
                                        </div>
                                    </div>
                                );
                            }) : <div className="text-center py-20"><BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" /><h3 className="text-xl font-bold mb-2">No active learning swaps</h3><p className="text-muted-foreground text-sm">Accept a swap request or explore the network to find a mentor.</p></div>}
                        </motion.div>
                    )}

                    {/* TEACHING HUB */}
                    {activeTab === "teaching" && (
                        <motion.div key="teaching" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                            <p className="text-sm font-bold text-rose-500 mb-4 bg-rose-500/10 inline-block px-3 py-1 rounded-lg">Teaching Capacity: {teaching.length}/5</p>
                            {teaching.length > 0 ? teaching.map(m => {
                                const prog = calculateProgress(m);
                                return (
                                    <div key={m.id} className="glass-elite p-8 rounded-3xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <span className="text-[11px] font-bold tracking-widest text-rose-500 uppercase mb-2 block">Mentor Node</span>
                                                <h2 className="text-3xl font-bold font-display mb-1">{m.skill.name}</h2>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">Student: <span className="font-semibold text-foreground">{m.student.name}</span></p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center"><Users className="w-6 h-6 text-rose-500" /></div>
                                        </div>

                                        <div className="mb-6 relative z-10">
                                            <div className="flex justify-between text-xs font-bold mb-2"><span className="text-muted-foreground uppercase tracking-wider">Student Progress</span><span className="text-rose-500">{prog}%</span></div>
                                            <div className="h-2 bg-surface/50 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${prog}%` }} /></div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 relative z-10">
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Target Hours</p><p className="font-bold text-lg">{m.targetDurationHours || 0}h</p></div>
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Classes Done</p><p className="font-bold text-lg">{m.classes?.filter((c:any)=>c.isCompleted).length || 0}</p></div>
                                            <div className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Assignments Done</p><p className="font-bold text-lg">{m.assignments?.filter((a:any)=>a.isCompleted).length || 0}</p></div>
                                            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20"><p className="text-[10px] uppercase font-bold text-rose-500 tracking-widest mb-1">Status</p><p className="font-bold text-lg text-rose-500">{m.status}</p></div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 relative z-10">
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("settings"); }} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2">Manage Swap</button>
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("class"); }} className="px-4 py-2 bg-surface/50 border border-border/40 hover:bg-muted text-sm font-bold rounded-xl flex items-center gap-2"><Calendar className="w-4 h-4"/> Schedule Class</button>
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("assignment"); }} className="px-4 py-2 bg-surface/50 border border-border/40 hover:bg-muted text-sm font-bold rounded-xl flex items-center gap-2"><FileText className="w-4 h-4"/> Add Assignment</button>
                                            <button onClick={() => { setActiveMentorship(m); setActiveModal("resource"); }} className="px-4 py-2 bg-surface/50 border border-border/40 hover:bg-muted text-sm font-bold rounded-xl flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Add Resource</button>
                                        </div>
                                    </div>
                                );
                            }) : <div className="text-center py-20"><Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" /><h3 className="text-xl font-bold mb-2">No active students</h3><p className="text-muted-foreground text-sm">Accept a swap request to start teaching your skills.</p></div>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODALS */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X className="w-5 h-5"/></button>
                        
                        {activeModal === "rate" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Rate Your Teacher</h3>
                                <p className="text-sm text-muted-foreground mb-4">Rate {activeMentorship?.teacher.name}'s classes this week.</p>
                                <input type="number" min="1" max="5" placeholder="Rating (1-5)" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} />
                                <textarea placeholder="Feedback (optional)" className="w-full p-3 rounded-xl bg-background border border-border mb-4 h-24" onChange={e => setFormData({...formData, feedback: e.target.value})}></textarea>
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/rate`, "POST", formData)} className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">Submit Rating</button>
                            </div>
                        )}

                        {activeModal === "leave" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-red-500">Leave Swap Early?</h3>
                                <p className="text-sm text-muted-foreground mb-4">If you leave the swap before the target hours are met, you will receive a 0.25 star reputation penalty.</p>
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/leave`, "POST")} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">I understand, Leave Swap</button>
                            </div>
                        )}

                        {activeModal === "settings" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Mentorship Settings</h3>
                                <p className="text-sm text-muted-foreground mb-2">Target Duration (Hours)</p>
                                <input type="number" placeholder="Target Hours (e.g. 20)" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, targetDurationHours: parseFloat(e.target.value)})} />
                                <p className="text-sm text-muted-foreground mb-2">Meeting Link (Zoom, Meet, etc)</p>
                                <input type="url" placeholder="https://..." className="w-full p-3 rounded-xl bg-background border border-border mb-4" onChange={e => setFormData({...formData, meetingLink: e.target.value})} />
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/progress`, "PUT", formData)} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl mb-2 hover:bg-primary/90 transition-colors">Save Settings</button>
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/leave`, "POST")} className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors">End Swap</button>
                            </div>
                        )}

                        {activeModal === "class" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Schedule Class</h3>
                                <input type="text" placeholder="Class Title" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <input type="datetime-local" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                <input type="number" placeholder="Duration (Minutes)" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} />
                                <label className="flex items-center gap-2 mb-4 text-sm font-bold"><input type="checkbox" onChange={e => setFormData({...formData, isCompleted: e.target.checked})} /> Mark as completed now (Grants bonus)</label>
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/classes`, "POST", formData)} className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors">Save Class</button>
                            </div>
                        )}

                        {activeModal === "assignment" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Create / Grade Assignment</h3>
                                <input type="text" placeholder="Assignment Title" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <input type="number" placeholder="Score (0-100)" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, score: parseFloat(e.target.value)})} />
                                <textarea placeholder="Feedback" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, feedback: e.target.value})}></textarea>
                                <label className="flex items-center gap-2 mb-4 text-sm font-bold"><input type="checkbox" onChange={e => setFormData({...formData, isCompleted: e.target.checked})} /> Mark as completed (Boosts student progress)</label>
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/assignments`, "POST", formData)} className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors">Save Assignment</button>
                            </div>
                        )}

                        {activeModal === "resource" && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Add Resource</h3>
                                <input type="text" placeholder="Resource Title" className="w-full p-3 rounded-xl bg-background border border-border mb-3" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <input type="url" placeholder="Resource URL" className="w-full p-3 rounded-xl bg-background border border-border mb-4" onChange={e => setFormData({...formData, url: e.target.value})} />
                                <button onClick={() => actionMentorship(`/api/mentorships/${activeMentorship.id}/resources`, "POST", formData)} className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors">Share Resource</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
