import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
    Users, Repeat2, FileText, Heart, MessageSquare, UserPlus, Mail,
    LayoutDashboard, RefreshCw, LogOut, TrendingUp, Activity,
    ChevronLeft, ChevronRight, Award, Star, Shield, Lock, Search, Filter,
    BarChart3, PieChart as PieIcon, Layers, Zap, Globe, Cpu, Radio, Network,
    MoreVertical, ArrowRight
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Overview {
    totalUsers: number;
    totalSwaps: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalFollows: number;
    totalWaitlist: number;
    swapFunnel: { PENDING: number; ACCEPTED: number; REJECTED: number; COMPLETED: number };
}
interface GrowthData { date: string; users: number; waitlist: number; }
interface SkillData { skill: string; category: string; count: number; }
interface UserRow {
    id: string; name: string; email: string; reputation: number;
    createdAt: string; swapCount: number; postCount: number; followerCount: number; avatarUrl?: string;
}
interface TopPost {
    id: string; preview: string; author: string; type: string;
    likes: number; comments: number; createdAt: string;
}
interface WaitlistEntry { email: string; createdAt: string; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

// ELITE PALETTE
const BRAND = {
    primary: "#6366f1", // Indigo
    secondary: "#22d3ee", // Cyan
    accent: "#8b5cf6", // Purple
    success: "#10b981", // Emerald
    warning: "#f59e0b", // Amber
    error: "#ef4444",   // Red
    obsidian: "#0a0b0f",
    slate: "#0f172a"
};

const FUNNEL_COLORS = ["#6366f1", "#22d3ee", "#8b5cf6", "#ec4899"];
const FUNNEL_LABELS = ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED"];

const NAV_ITEMS = [
    { id: "overview", label: "Intelligence", icon: LayoutDashboard },
    { id: "growth", label: "Scale Metrics", icon: TrendingUp },
    { id: "users", label: "Registry", icon: Users },
    { id: "swaps", label: "Sync Flow", icon: Repeat2 },
    { id: "skills", label: "Skill Clusters", icon: Star },
    { id: "engagement", label: "Pulse", icon: Activity },
    { id: "waitlist", label: "Ingress", icon: Mail },
];

// ─── ELITE COMPONENTS ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-4 shadow-3xl ring-1 ring-white/5 min-w-[200px]"
        >
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">{label}</span>
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-3">
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-8 group">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}40` }} />
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">{p.name}</span>
                        </div>
                        <span className="text-[13px] font-black text-white italic tracking-tighter">{p.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest text-center">Live Telemetry Link Active</p>
            </div>
        </motion.div>
    );
};

function KpiCard({ label, value, icon: Icon, color, sub, trend }: {
    label: string; value: number | string; icon: any; color: string; sub?: string; trend?: string;
}) {
    return (
        <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative bg-slate-900/20 border border-white/[0.03] rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-slate-900/40 hover:border-white/10 shadow-2xl"
        >
            {/* AMBIENT GLOW */}
            <div className="absolute -top-12 -right-12 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none" style={{ background: color }} />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-white/60 transition-colors leading-none">{label}</span>
                    <div className="h-[2px] w-5 bg-white/5 group-hover:w-12 group-hover:bg-primary transition-all duration-700 ease-out" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-2xl group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-500">
                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color }} />
                </div>
            </div>

            <div className="flex items-baseline gap-4 mb-3">
                <span className="text-[2.75rem] font-black text-white font-heading tracking-[-0.04em] leading-none group-hover:text-indigo-200 transition-colors">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </span>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 shadow-lg shadow-green-500/5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {trend}
                    </div>
                )}
            </div>
            
            {sub && <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">{sub}</p>}
        </motion.div>
    );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="mb-16 relative">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-500/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400 italic opacity-80">Command Protocol Omega</span>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
            </div>
            <h2 className="text-5xl font-black tracking-[-0.03em] text-white uppercase font-heading leading-none mb-4">{title}</h2>
            <p className="text-base text-zinc-500 font-medium max-w-3xl leading-relaxed">{sub}</p>
        </div>
    );
}

function ChartCard({ title, children, icon: Icon, fullHeight = false }: { title: string; children: React.ReactNode; icon?: any; fullHeight?: boolean }) {
    return (
        <div className={`bg-[#0a0b10]/40 border border-white/[0.04] rounded-[3rem] p-10 shadow-3xl relative overflow-hidden group/card shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${fullHeight ? 'h-full' : ''}`}>
            {/* SUBTLE GRID OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                        {Icon ? <Icon className="w-4 h-4 text-indigo-400" /> : <Layers className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover/card:text-zinc-300 transition-colors">{title}</h3>
                        <div className="h-0.5 w-8 bg-indigo-500/20 group-hover/card:w-16 transition-all duration-700" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-colors"><Search className="w-3 h-3 text-zinc-600" /></button>
                    <button className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-colors"><MoreVertical className="w-3 h-3 text-zinc-600" /></button>
                </div>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// ─── MAIN OVERHAUL ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const router = useRouter();
    const [adminKey, setAdminKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Data state
    const [overview, setOverview] = useState<Overview | null>(null);
    const [growth, setGrowth] = useState<GrowthData[]>([]);
    const [skills, setSkills] = useState<{ topTaught: SkillData[]; topWanted: SkillData[] } | null>(null);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [engagement, setEngagement] = useState<{ topPosts: TopPost[]; postsByDay: { date: string; count: number }[] } | null>(null);
    const [waitlist, setWaitlist] = useState<{ total: number; recent: WaitlistEntry[]; chartData: { date: string; count: number }[] } | null>(null);

    // ── Auth guard
    useEffect(() => {
        if (typeof window !== "undefined") {
            const key = sessionStorage.getItem("swapifhy_admin_key");
            if (!key) { router.replace("/admin/login"); return; }
            setAdminKey(key);
        }
    }, []);

    const apiFetch = useCallback(
        async (endpoint: string) => {
            if (!adminKey) return null;
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    headers: { "x-admin-key": adminKey },
                });
                if (res.status === 401) { sessionStorage.removeItem("swapifhy_admin_key"); router.replace("/admin/login"); return null; }
                if (!res.ok) return null;
                return res.json();
            } catch (err) {
                console.error("[Protocol Error] Uplink Interrupted:", err);
                return null;
            }
        },
        [adminKey]
    );

    const loadOverview = useCallback(async () => {
        const data = await apiFetch("/api/admin/overview");
        if (data) setOverview(data);
    }, [apiFetch]);

    const loadGrowth = useCallback(async () => {
        const data = await apiFetch("/api/admin/growth");
        if (data) setGrowth(data.chartData);
    }, [apiFetch]);

    const loadSkills = useCallback(async () => {
        const data = await apiFetch("/api/admin/skills");
        if (data) setSkills(data);
    }, [apiFetch]);

    const loadUsers = useCallback(async (page = 1) => {
        const data = await apiFetch(`/api/admin/users?page=${page}&limit=15`);
        if (data) {
            setUsers(data.users);
            setTotalUsers(data.total);
            setUserPage(data.page);
            setUserTotalPages(data.totalPages);
        }
    }, [apiFetch]);

    const loadEngagement = useCallback(async () => {
        const data = await apiFetch("/api/admin/engagement");
        if (data) setEngagement(data);
    }, [apiFetch]);

    const loadWaitlist = useCallback(async () => {
        const data = await apiFetch("/api/admin/waitlist");
        if (data) setWaitlist(data);
    }, [apiFetch]);

    useEffect(() => {
        if (!adminKey) return;
        setLoading(true);
        Promise.all([loadOverview(), loadGrowth()]).finally(() => setLoading(false));
    }, [adminKey]);

    useEffect(() => {
        if (!adminKey) return;
        if (activeTab === "skills" && !skills) loadSkills();
        if (activeTab === "users" && users.length === 0) loadUsers(1);
        if (activeTab === "engagement" && !engagement) loadEngagement();
        if (activeTab === "waitlist" && !waitlist) loadWaitlist();
    }, [activeTab, adminKey]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadOverview(), loadGrowth(),
            activeTab === "skills" ? loadSkills() : Promise.resolve(),
            activeTab === "users" ? loadUsers(userPage) : Promise.resolve(),
            activeTab === "engagement" ? loadEngagement() : Promise.resolve(),
            activeTab === "waitlist" ? loadWaitlist() : Promise.resolve(),
        ]);
        setRefreshing(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("swapifhy_admin_key");
        router.push("/admin/login");
    };

    if (!adminKey || loading) {
        return (
            <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8">
                    <div className="relative">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-t-2 border-primary rounded-full blur-[8px] absolute inset-0 opacity-40" />
                        <div className="w-24 h-24 border-t-2 border-primary rounded-full relative z-10 animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-white text-[14px] font-black uppercase tracking-[0.8em] animate-pulse">Syncing Intel Matrix</p>
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em] italic opacity-40">Protocol Level: EXTREME</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    const funnelData = overview ? FUNNEL_LABELS.map((l, i) => ({
        name: l,
        value: overview.swapFunnel[l as keyof typeof overview.swapFunnel],
        color: FUNNEL_COLORS[i],
    })) : [];

    return (
        <div className="min-h-screen bg-[#06070a] font-sans text-white selection:bg-indigo-500/30 overflow-hidden flex flex-col">
            <Head>
                <title>Intelligence Center — Swapifhy Delta</title>
                <meta name="robots" content="noindex" />
            </Head>

            {/* SYNC GRID BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[#06070a]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full opacity-40" />
                <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="flex relative z-10 flex-1 h-screen overflow-hidden">
                {/* ── ELITE SIDEBAR ── */}
                <aside className="w-[320px] shrink-0 border-r border-white/[0.04] flex flex-col bg-[#08090d]/60 backdrop-blur-3xl shadow-2xl relative">
                    {/* Brand Node */}
                    <div className="px-12 py-12">
                        <div className="flex items-center gap-5 group cursor-pointer">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-all duration-700 shadow-2xl group-hover:shadow-indigo-500/20">
                                <img src="https://www.swapifhy.com/assets/swapifhy-logo-DPxPDdg-.png" alt="logo" className="w-7 h-7 object-contain" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[15px] font-black tracking-[0.1em] uppercase text-white leading-none">Swapifhy</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
                                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] opacity-80 italic">Delta V4.0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-8 space-y-3 overflow-y-auto custom-scrollbar pt-4">
                        <div className="px-5 mb-6">
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.6em]">Node Hub</span>
                        </div>
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.75rem] text-[13px] font-black tracking-widest transition-all duration-500 relative group truncate ${active
                                        ? "bg-indigo-500/10 text-white border border-indigo-500/20 shadow-xl shadow-indigo-500/5 translate-x-3"
                                        : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02]"
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <Icon className={`w-4 h-4 transition-all duration-500 ${active ? "text-indigo-400 scale-110" : "group-hover:text-zinc-400"}`} />
                                        <span className="uppercase tracking-[0.2em]">{item.label}</span>
                                    </div>
                                    {active && (
                                        <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-10 border-t border-white/[0.04] space-y-4 bg-white/[0.01]">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white hover:bg-indigo-500/10 border border-white/[0.04] transition-all group overflow-hidden relative shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <RefreshCw className={`w-4 h-4 relative z-10 transition-transform duration-1000 ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`} />
                            <span className="relative z-10">Resync Intel</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 transition-all shadow-xl"
                        >
                            <LogOut className="w-4 h-4" />
                            Disconnect
                        </button>
                    </div>
                </aside>

                {/* ── ELITE VIEWPORT ── */}
                <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative px-16 py-20">
                    <div className="max-w-[1500px] mx-auto">

                        <AnimatePresence mode="wait">
                            {/* ── OVERVIEW ── */}
                            {activeTab === "overview" && (
                                <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                                    <SectionHeader title="Delta Analytics" sub="Comprehensive intelligence overview of multi-node platform vitality and synchronization yields." />
                                    
                                    {overview ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
                                                <KpiCard label="Global Nodes" value={overview.totalUsers} icon={Globe} color="#6366f1" sub="Verified Identities" trend="14.2%" />
                                                <KpiCard label="Intel Yield" value={overview.totalSwaps} icon={Network} color="#22d3ee" sub="Protocol Velocity" trend="8.5%" />
                                                <KpiCard label="Shield Log" value={overview.totalWaitlist} icon={Shield} color="#8b5cf6" sub="Ingress Buffer" trend="31.0%" />
                                                <KpiCard label="Ledger Assets" value={overview.totalPosts} icon={FileText} color="#10b981" sub="Broadcast Packets" />
                                                <KpiCard label="Node Resonance" value={overview.totalLikes} icon={Heart} color="#f43f5e" />
                                                <KpiCard label="Echo Matrix" value={overview.totalComments} icon={MessageSquare} color="#f59e0b" />
                                                <KpiCard label="Link Density" value={overview.totalFollows} icon={UserPlus} color="#3b82f6" />
                                                <KpiCard label="Final Syncs" value={overview.swapFunnel.COMPLETED} icon={Award} color="#4ade80" sub="Closed Handshakes" />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                <div className="lg:col-span-2">
                                                    <ChartCard title="Sync Pulse Velocity" icon={Activity}>
                                                        <div className="h-[400px] pt-8 pr-4">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={growth}>
                                                                    <defs>
                                                                        <linearGradient id="pUsers" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                        </linearGradient>
                                                                        <linearGradient id="pWaitlist" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                                    <XAxis dataKey="date" hide />
                                                                    <YAxis hide />
                                                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                                                    <Area type="monotone" dataKey="users" name="Active Ingress" stroke="#6366f1" strokeWidth={5} fill="url(#pUsers)" dot={false} strokeLinecap="round" />
                                                                    <Area type="monotone" dataKey="waitlist" name="Waitlist Pool" stroke="#22d3ee" strokeWidth={5} fill="url(#pWaitlist)" dot={false} strokeLinecap="round" />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </ChartCard>
                                                </div>

                                                <div className="lg:col-span-1">
                                                    <ChartCard title="Cycle Composition" icon={PieIcon} fullHeight>
                                                        <div className="h-[400px] flex flex-col justify-center">
                                                            <div className="h-[280px]">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie data={funnelData} cx="50%" cy="50%" innerRadius={80} outerRadius={115} paddingAngle={10} dataKey="value" stroke="none">
                                                                            {funnelData.map((entry, i) => (
                                                                                <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 12px ${entry.color}40)` }} />
                                                                            ))}
                                                                        </Pie>
                                                                        <Tooltip content={<CustomTooltip />} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="mt-8 grid grid-cols-2 gap-4 px-6">
                                                                {funnelData.map((d, i) => (
                                                                    <div key={i} className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                                                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">{d.name}</span>
                                                                        </div>
                                                                        <span className="text-sm font-black text-white italic tracking-tighter ml-3.5">{d.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </ChartCard>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <LoadingSpinner />
                                    )}
                                </motion.div>
                            )}

                            {/* ── REGISTRY ── */}
                            {activeTab === "users" && (
                                <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                                    <SectionHeader title="Identity Registry" sub={`Distributed ledger tracking ${totalUsers.toLocaleString()} active nodes in the Swapifhy network.`} />
                                    
                                    <div className="space-y-8">
                                        {/* List Controls */}
                                        <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                                            <div className="relative w-full max-w-lg group">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                                <input placeholder="Synchronizing Fuzzy Search..." className="w-full bg-[#0a0b10]/60 border border-white/[0.04] rounded-3xl py-6 pl-16 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all shadow-inner font-medium tracking-tight" />
                                            </div>
                                            <div className="flex gap-4 w-full xl:w-auto">
                                                <button className="flex-1 xl:flex-none px-8 py-6 bg-white/[0.02] rounded-3xl border border-white/[0.04] text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3"><Filter className="w-4 h-4" /> Attributes</button>
                                                <button className="flex-1 xl:flex-none px-10 py-6 bg-indigo-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-indigo-600/30 hover:scale-[1.03] active:scale-95 transition-all">Export Protocol</button>
                                            </div>
                                        </div>

                                        <div className="bg-[#0a0b10]/40 border border-white/[0.03] rounded-[3.5rem] overflow-hidden shadow-3xl relative">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                                                        {["Identity Node", "Reputation", "Activity", "Sync Status", "Access"].map((h) => (
                                                            <th key={h} className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 leading-none">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.03]">
                                                    {users.map((u, i) => (
                                                        <tr key={u.id} className="group hover:bg-indigo-500/[0.02] transition-all cursor-pointer">
                                                            <td className="px-10 py-7">
                                                                <div className="flex items-center gap-5">
                                                                    <div className="w-14 h-14 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-indigo-400 overflow-hidden shrink-0 group-hover:scale-110 transition-all duration-500 shadow-2xl relative">
                                                                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover relative z-10" alt="" /> : <span className="text-xl font-black relative z-10">{u.name.charAt(0).toUpperCase()}</span>}
                                                                    </div>
                                                                    <div className="flex flex-col gap-1 min-w-0">
                                                                        <span className="text-[15px] font-black text-white group-hover:text-indigo-400 transition-colors truncate tracking-[-0.02em]">{u.name}</span>
                                                                        <span className="text-[11px] text-zinc-600 font-bold truncate italic tracking-tighter opacity-70 leading-none">{u.email}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-7">
                                                                <div className="flex items-center gap-3">
                                                                    <Star className="w-4 h-4 text-indigo-500 fill-indigo-500/20 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                                    <span className="text-lg font-black text-white italic tracking-tighter">{u.reputation}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-7">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">Swaps</span>
                                                                        <span className="text-sm font-black text-zinc-400 italic leading-none">{u.swapCount}</span>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-white/[0.03]" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">Posts</span>
                                                                        <span className="text-sm font-black text-zinc-400 italic leading-none">{u.postCount}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-7">
                                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Linked</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-7 text-right">
                                                                <button className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-zinc-600 hover:text-white hover:border-white/20 transition-all"><ArrowRight className="w-4 h-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-between mt-12 px-8">
                                            <div className="flex items-center gap-3">
                                                <Layers className="w-4 h-4 text-zinc-600" />
                                                <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] italic opacity-60">Record Batch: {userPage} OF {userTotalPages}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => loadUsers(userPage - 1)} disabled={userPage <= 1} className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] hover:border-white/10 disabled:opacity-20 transition-all duration-500 group"><ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" /></button>
                                                <div className="h-1 bg-white/[0.05] w-24 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(userPage / userTotalPages) * 100}%` }} className="h-full bg-indigo-500" />
                                                </div>
                                                <button onClick={() => loadUsers(userPage + 1)} disabled={userPage >= userTotalPages} className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] hover:border-white/10 disabled:opacity-20 transition-all duration-500 group"><ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* OTHER TABS (WIP) */}
                            {["growth", "swaps", "skills", "engagement", "waitlist"].includes(activeTab) && (
                                <motion.div key="other" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[70vh] flex flex-col items-center justify-center text-center">
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center mb-10 relative group">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full group-hover:animate-pulse" />
                                        <Cpu className="w-12 h-12 text-indigo-400 relative z-10 group-hover:rotate-12 transition-transform duration-700" />
                                    </div>
                                    <h3 className="text-[14px] font-black uppercase tracking-[0.8em] text-white/40 mb-4 ml-6 font-heading">Advanced Module Optimizing</h3>
                                    <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest max-w-sm italic opacity-60">The {activeTab.toUpperCase()} analytical layer is currently synchronizing with the central Delta relay. High-bandwidth sync active.</p>
                                    <div className="mt-8 flex gap-2">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-3 bg-indigo-500/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />)}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </main>
            </div>

            {/* STATUS BAR */}
            <div className="h-10 border-t border-white/[0.04] bg-[#08090d]/80 backdrop-blur-md px-10 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span>System: Optimal</span>
                    </div>
                    <span className="opacity-30">|</span>
                    <div className="flex items-center gap-2">
                        <Activity className="w-2.5 h-2.5" />
                        <span>Uplink: 142.4 Gb/s</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span>Protocol: HTTPS/3</span>
                    <span className="opacity-30">|</span>
                    <span className="text-indigo-400">© 2026 Swapifhy Global Intelligence</span>
                </div>
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-40 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-[3px] border-indigo-500/10 rounded-full" />
                <div className="w-20 h-20 border-t-[3px] border-indigo-500 rounded-full absolute inset-0 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                </div>
            </div>
            <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.6em] animate-pulse">Establishing Delta Uplink...</p>
        </div>
    );
}
