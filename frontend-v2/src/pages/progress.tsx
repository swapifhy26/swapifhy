import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BookOpen, Users, Star, Award, Clock, ArrowUpRight, CheckCircle2, Zap, MessageSquare, Lock } from "lucide-react";
import { API_URL } from "../lib/api";

// ── Badge definitions with unlock conditions ──
const BADGE_DEFINITIONS = [
    {
        id: "early_bird",
        name: "Early Bird",
        description: "Complete your first swap",
        icon: <Zap className="w-5 h-5" />,
        color: "bg-amber-500",
        lockedColor: "bg-muted/30",
        check: (s: any) => s.totalSwaps >= 1
    },
    {
        id: "dedicated_learner",
        name: "Dedicated Learner",
        description: "Learn for 10+ hours",
        icon: <BookOpen className="w-5 h-5" />,
        color: "bg-primary",
        lockedColor: "bg-muted/30",
        check: (s: any) => s.hoursLearned >= 10
    },
    {
        id: "top_mentor",
        name: "Top Mentor",
        description: "Teach for 10+ hours",
        icon: <Award className="w-5 h-5" />,
        color: "bg-secondary",
        lockedColor: "bg-muted/30",
        check: (s: any) => s.hoursTaught >= 10
    },
    {
        id: "rising_star",
        name: "Rising Star",
        description: "Reach 4.5+ avg rating",
        icon: <Star className="w-5 h-5" />,
        color: "bg-rose-500",
        lockedColor: "bg-muted/30",
        check: (s: any) => s.avgRating >= 4.5
    },
    {
        id: "swap_veteran",
        name: "Swap Veteran",
        description: "Complete 10+ swaps",
        icon: <Users className="w-5 h-5" />,
        color: "bg-violet-500",
        lockedColor: "bg-muted/30",
        check: (s: any) => s.totalSwaps >= 10
    },
    {
        id: "marathon",
        name: "Marathon",
        description: "Accumulate 50+ hours total",
        icon: <TrendingUp className="w-5 h-5" />,
        color: "bg-emerald-500",
        lockedColor: "bg-muted/30",
        check: (s: any) => (s.hoursLearned + s.hoursTaught) >= 50
    }
];

export default function Progress() {
    const [activeTab, setActiveTab] = useState<"overview" | "learning" | "teaching">("overview");
    const [stats, setStats] = useState({
        totalSwaps: 0,
        hoursLearned: 0,
        hoursTaught: 0,
        avgRating: 0
    });

    const [learningSkills, setLearningSkills] = useState<any[]>([]);
    const [teachingSkills, setTeachingSkills] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (token) {
            fetch(`${API_URL}/api/user/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        const u = data.user;

                        setStats({
                            totalSwaps: u.totalSwaps ?? u.reputation ?? 0,
                            hoursLearned: u.hoursLearned ?? 0,
                            hoursTaught: u.hoursTaught ?? 0,
                            avgRating: u.avgRating ?? 0
                        });

                        setLearningSkills(
                            u.learnSkills?.map((s: any, i: number) => ({
                                id: i,
                                name: s.name ?? s,
                                partner: s.partnerName ?? "Pending Match",
                                progress: s.progress ?? 0,
                                sessions: s.sessions ?? 0,
                                hoursSpent: s.hoursSpent ?? 0,
                                nextMilestone: s.nextMilestone ?? "Find a mentor",
                            })) || []
                        );

                        setTeachingSkills(
                            u.teachSkills?.map((s: any, i: number) => ({
                                id: i,
                                name: s.name ?? s,
                                student: s.studentName ?? "Pending Student",
                                progress: s.progress ?? 0,
                                sessions: s.sessions ?? 0,
                                hoursSpent: s.hoursSpent ?? 0,
                                rating: s.rating ?? 0,
                                testimonial: s.testimonial ?? "Ready to teach.",
                            })) || []
                        );
                    }
                    setLoaded(true);
                })
                .catch(() => setLoaded(true));
        }
    }, []);

    const earnedBadges = BADGE_DEFINITIONS.filter(b => b.check(stats));
    const lockedBadges = BADGE_DEFINITIONS.filter(b => !b.check(stats));

    const milestones = [
        { label: "Hours Learned", value: stats.hoursLearned, max: 50, color: "bg-teal-500", icon: <Clock className="w-4 h-4 text-teal-500" /> },
        { label: "Hours Taught", value: stats.hoursTaught, max: 50, color: "bg-rose-500", icon: <BookOpen className="w-4 h-4 text-rose-500" /> },
        { label: "Total Swaps", value: stats.totalSwaps, max: 20, color: "bg-violet-500", icon: <Users className="w-4 h-4 text-violet-500" /> },
        { label: "Avg Rating", value: stats.avgRating, max: 5, color: "bg-amber-500", icon: <Star className="w-4 h-4 text-amber-500" /> },
    ];

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-24">
            
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

            <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight mb-4">
                        Your <span className={`transition-colors duration-500 ${
                            activeTab === "learning" ? "text-teal-500" : activeTab === "teaching" ? "text-rose-500" : "text-primary"
                        }`}>Progress</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
                        Track your learning journey, manage your teaching swaps, and celebrate your milestones.
                    </p>
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

                {/* Tab Content */}
                <AnimatePresence mode="wait">

                    {/* ── OVERVIEW ── */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

                            {/* Milestone Progress Bars */}
                            <div className="glass-elite p-10 rounded-[2.5rem] space-y-8">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                                    <TrendingUp className="w-6 h-6 text-primary" /> Milestones
                                </h3>
                                {milestones.map((m, i) => {
                                    const pct = Math.min((m.value / m.max) * 100, 100);
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    {m.icon} {m.label}
                                                </span>
                                                <span className="text-foreground">
                                                    {m.label === "Avg Rating"
                                                        ? `${m.value > 0 ? m.value.toFixed(1) : "0"} / ${m.max}`
                                                        : `${m.value} / ${m.max}`}
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted/20 rounded-full overflow-hidden border border-border/20">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 1, delay: i * 0.15 }}
                                                    className={`h-full ${m.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Achievements */}
                            <div className="glass-elite p-10 rounded-[2.5rem]">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-foreground">
                                    <Award className="w-6 h-6 text-primary" /> Achievements
                                </h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
                                    {earnedBadges.length} / {BADGE_DEFINITIONS.length} unlocked
                                </p>

                                {earnedBadges.length > 0 && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Unlocked</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                            {earnedBadges.map(badge => (
                                                <div key={badge.id} className="flex flex-col items-center gap-3 group">
                                                    <div className={`w-16 h-16 rounded-[1.5rem] ${badge.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all relative overflow-hidden`}>
                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        {badge.icon}
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground text-center leading-tight">{badge.name}</span>
                                                    <span className="text-[9px] text-muted-foreground text-center leading-tight opacity-70">{badge.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {lockedBadges.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Locked</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                            {lockedBadges.map(badge => (
                                                <div key={badge.id} className="flex flex-col items-center gap-3 group opacity-50 hover:opacity-70 transition-opacity">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-muted/20 border border-border/40 flex items-center justify-center relative">
                                                        <Lock className="w-5 h-5 text-muted-foreground/50" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground text-center leading-tight">{badge.name}</span>
                                                    <span className="text-[9px] text-muted-foreground/60 text-center leading-tight">{badge.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── LEARNING (GREENISH/TEAL GLASS) ── */}
                    {activeTab === "learning" && (
                        <motion.div
                            key="learning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {learningSkills.length > 0 ? learningSkills.map((skill) => (
                                <div key={skill.id} className="glass-elite p-8 rounded-[2.5rem] group border border-teal-500/10 hover:border-teal-500/40 transition-all flex flex-col shadow-[0_4px_30px_rgba(20,184,166,0.03)] bg-gradient-to-b from-teal-500/[0.02] to-transparent">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-2 block">Ongoing Learning</span>
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-teal-500 transition-colors">{skill.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">
                                                Teacher: <span className="text-foreground font-bold">{skill.partner}</span>
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                <span>Progress</span>
                                                <span className="text-teal-500">{skill.progress}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Sessions</span>
                                                <p className="text-lg font-black text-foreground">{skill.sessions}</p>
                                            </div>
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Hours</span>
                                                <p className="text-lg font-black text-foreground">{skill.hoursSpent}h</p>
                                            </div>
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Status</span>
                                                <p className="text-lg font-black text-emerald-500">Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/10 mb-8 flex-grow">
                                        <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Next Milestone
                                        </h4>
                                        <p className="text-sm font-bold text-foreground">{skill.nextMilestone}</p>
                                    </div>

                                    <button className="w-full py-4 rounded-2xl bg-foreground text-background font-bold text-sm hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(20,184,166,0.15)] transition-all flex items-center justify-center gap-2">
                                        Book Next Session <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full glass-elite p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center border border-teal-500/20">
                                    <div className="w-20 h-20 rounded-[2rem] bg-teal-500/10 text-teal-500 flex items-center justify-center mb-6">
                                        <BookOpen className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-3">Ready to start learning?</h3>
                                    <p className="text-muted-foreground max-w-md italic mb-8">
                                        &quot;The beautiful thing about learning is that no one can take it away from you.&quot; — B.B. King
                                    </p>
                                    <Link href="/explore" className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
                                        Find a Mentor
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── TEACHING (PINKISH/CORAL GLASS) ── */}
                    {activeTab === "teaching" && (
                        <motion.div
                            key="teaching"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {teachingSkills.length > 0 ? teachingSkills.map((skill) => (
                                <div key={skill.id} className="glass-elite p-8 rounded-[2.5rem] group border border-rose-500/10 hover:border-rose-500/40 transition-all flex flex-col shadow-[0_4px_30px_rgba(244,63,94,0.03)] bg-gradient-to-b from-rose-500/[0.02] to-transparent">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2 block">Mentor Node</span>
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-rose-500 transition-colors">{skill.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">
                                                Student: <span className="text-foreground font-bold">{skill.student}</span>
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span>Teaching Progress</span>
                                            <span className="text-rose-500">{skill.progress}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.progress}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-8">
                                        <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40 text-center">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Rating</span>
                                            <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                                                {skill.rating > 0 ? skill.rating.toFixed(1) : "—"}
                                                <Star className="w-4 h-4 fill-amber-500" />
                                            </p>
                                        </div>
                                        <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40 text-center">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Sessions</span>
                                            <p className="text-lg font-black text-foreground">{skill.sessions}</p>
                                        </div>
                                        <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40 text-center">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Hours</span>
                                            <p className="text-lg font-black text-foreground">{skill.hoursSpent}h</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 relative overflow-hidden flex-grow">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                        <MessageSquare className="absolute right-4 top-4 w-12 h-12 text-rose-500/10 -rotate-12" />
                                        <p className="text-sm font-medium italic text-muted-foreground leading-relaxed relative z-10">
                                            &quot;{skill.testimonial}&quot;
                                        </p>
                                    </div>

                                    <button className="mt-8 w-full py-4 rounded-2xl border border-rose-500/30 text-rose-500 font-bold text-sm hover:bg-rose-500/5 hover:shadow-[0_4px_20px_rgba(244,63,94,0.05)] transition-all flex items-center justify-center gap-2">
                                        Update Progress <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full glass-elite p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center border border-rose-500/20">
                                    <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                                        <Users className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-3">Share your knowledge!</h3>
                                    <p className="text-muted-foreground max-w-md italic mb-8">
                                        &quot;In learning you will teach, and in teaching you will learn.&quot; — Phil Collins
                                    </p>
                                    <Link href="/explore" className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
                                        Find a Student
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
