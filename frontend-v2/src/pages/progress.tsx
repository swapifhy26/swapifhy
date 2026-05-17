import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BookOpen, Users, Star, Award, Clock, ArrowUpRight, CheckCircle2, Zap, MessageSquare } from "lucide-react";
import { API_URL } from "../lib/api";

export default function Progress() {
    const [activeTab, setActiveTab] = useState<"overview" | "learning" | "teaching">("overview");
    const [stats, setStats] = useState({
        totalSwaps: 12,
        hoursLearned: 24,
        hoursTaught: 18,
        avgRating: 4.9
    });

    const [learningSkills, setLearningSkills] = useState([
        { id: 1, name: "Advanced React", partner: "Sarah Chen", progress: 65, sessions: 8, nextMilestone: "Custom Hooks Mastery", feedback: "Great progress on state management!" },
        { id: 2, name: "UI/UX Design", partner: "Marcus Miller", progress: 40, sessions: 4, nextMilestone: "Auto Layout & Components", feedback: "Strong eye for detail." }
    ]);

    const [teachingSkills, setTeachingSkills] = useState([
        { id: 3, name: "Python for Data", student: "Leo Zhang", progress: 85, sessions: 12, rating: 5.0, testimonial: "The best mentor I've had. Very clear explanations." },
        { id: 4, name: "Public Speaking", student: "Emma Watson", progress: 20, sessions: 2, rating: 4.8, testimonial: "Really helped me with my confidence." }
    ]);

    const badges = [
        { id: 1, name: "Early Bird", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500" },
        { id: 2, name: "Top Mentor", icon: <Award className="w-5 h-5" />, color: "bg-primary" },
        { id: 3, name: "Fast Learner", icon: <TrendingUp className="w-5 h-5" />, color: "bg-secondary" },
        { id: 4, name: "Community Star", icon: <Star className="w-5 h-5" />, color: "bg-accent" }
    ];

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight mb-4">
                        Your <span className="text-primary">Progress</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
                        Track your learning journey, manage your teaching swaps, and celebrate your milestones.
                    </p>
                </div>

                {/* Main Tab Toggle */}
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
                    <button 
                        onClick={() => setActiveTab("overview")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === "overview" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab("learning")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === "learning" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Learning
                    </button>
                    <button 
                        onClick={() => setActiveTab("teaching")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === "teaching" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Teaching
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
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
                                    { label: "Hours Learned", value: stats.hoursLearned, icon: <Clock className="w-5 h-5 text-secondary" />, bg: "bg-secondary/10" },
                                    { label: "Hours Taught", value: stats.hoursTaught, icon: <BookOpen className="w-5 h-5 text-accent" />, bg: "bg-accent/10" },
                                    { label: "Avg Rating", value: stats.avgRating, icon: <Star className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" }
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

                            {/* Achievements Grid */}
                            <div className="glass-elite p-10 rounded-[2.5rem]">
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Award className="w-6 h-6 text-primary" /> Achievements
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {badges.map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center gap-4 group">
                                            <div className={`w-20 h-20 rounded-[2rem] ${badge.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                {badge.icon}
                                            </div>
                                            <span className="text-sm font-bold text-foreground text-center">{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "learning" && (
                        <motion.div 
                            key="learning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {learningSkills.map((skill) => (
                                <div key={skill.id} className="glass-elite p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 block">Ongoing Learning</span>
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{skill.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Teacher: <span className="text-foreground font-bold">{skill.partner}</span></p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span>Progress</span>
                                                <span className="text-primary">{skill.progress}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(114,191,204,0.4)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Sessions</span>
                                                <p className="text-lg font-black text-foreground">{skill.sessions}</p>
                                            </div>
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Status</span>
                                                <p className="text-lg font-black text-green-500">Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 mb-8 flex-grow">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Next Milestone
                                        </h4>
                                        <p className="text-sm font-bold text-foreground">{skill.nextMilestone}</p>
                                    </div>

                                    <button className="w-full py-4 rounded-2xl bg-foreground text-background font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                        Book Next Session <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "teaching" && (
                        <motion.div 
                            key="teaching"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {teachingSkills.map((skill) => (
                                <div key={skill.id} className="glass-elite p-8 rounded-[2.5rem] group hover:border-secondary/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-2 block">Mentor Node</span>
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">{skill.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Student: <span className="text-foreground font-bold">{skill.student}</span></p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40 text-center">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Rating</span>
                                                <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                                                    {skill.rating} <Star className="w-4 h-4 fill-amber-500" />
                                                </p>
                                            </div>
                                            <div className="flex-1 p-4 rounded-2xl bg-surface/40 border border-border/40 text-center">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Sessions</span>
                                                <p className="text-lg font-black text-foreground">{skill.sessions}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 relative overflow-hidden group/quote">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                                        <MessageSquare className="absolute right-4 top-4 w-12 h-12 text-secondary/10 -rotate-12" />
                                        <p className="text-sm font-medium italic text-muted-foreground leading-relaxed relative z-10">
                                            "{skill.testimonial}"
                                        </p>
                                    </div>

                                    <button className="mt-8 w-full py-4 rounded-2xl border border-secondary/30 text-secondary font-bold text-sm hover:bg-secondary/5 transition-all flex items-center justify-center gap-2">
                                        Update Progress <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
