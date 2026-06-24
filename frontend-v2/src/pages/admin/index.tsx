import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
    Users, Repeat2, FileText, Heart, MessageSquare, UserPlus, Mail,
    LayoutDashboard, RefreshCw, LogOut, Star, Activity, ChevronLeft,
    ChevronRight, CheckCircle2, Wifi, Settings, Moon, Sun, Trash2,
    UserX, UserCheck, Plus, Edit2, X, AlertTriangle, Shield, Ban,
    Search, Save, Bell, Key, Globe, Database, ChevronDown
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, CartesianGrid
} from "recharts";

interface Overview {
    totalUsers: number; totalSwaps: number; totalPosts: number;
    totalLikes: number; totalComments: number; totalFollows: number;
    totalWaitlist: number; activeNow: number;
    swapFunnel: { PENDING: number; ACCEPTED: number; REJECTED: number; COMPLETED: number };
}
interface GrowthData { date: string; users: number; waitlist: number; }
interface SkillData { skill: string; category: string; count: number; }
interface UserRow {
    id: string; name: string; email: string; reputation: number;
    createdAt: string; swapCount: number; postCount: number;
    followerCount: number; avatarUrl?: string; isBanned?: boolean;
}
interface TopPost {
    id: string; preview: string; content?: string; author: string;
    type: string; likes: number; comments: number; createdAt: string; userId?: string;
}
interface WaitlistEntry { id?: string; email: string; createdAt: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
const FUNNEL_COLORS = ["#6366f1", "#10b981", "#22d3ee", "#ef4444"];
const FUNNEL_LABELS: Array<keyof Overview["swapFunnel"]> = ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED"];
const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "skills", label: "Skills", icon: Star },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "waitlist", label: "Waitlist", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
];

// ── Confirm Modal ──
function ConfirmModal({ open, title, message, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }: {
    open: boolean; title: string; message: string; confirmLabel?: string;
    danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl max-w-sm w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-50 dark:bg-red-900/20" : "bg-indigo-50 dark:bg-indigo-900/20"}`}>
                    <AlertTriangle className={`w-6 h-6 ${danger ? "text-red-500" : "text-indigo-500"}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

// ── Edit Post Modal ──
function EditPostModal({ post, onSave, onClose }: { post: TopPost; onSave: (id: string, content: string) => void; onClose: () => void; }) {
    const [content, setContent] = useState(post.content || post.preview);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl max-w-lg w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit Post</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                </div>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-indigo-400 resize-none" />
                <div className="flex gap-3 mt-4">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(post.id, content); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Add Waitlist Modal ──
function AddWaitlistModal({ onAdd, onClose }: { onAdd: (email: string) => void; onClose: () => void; }) {
    const [email, setEmail] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl max-w-sm w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Add to Waitlist</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-indigo-400 mb-4" />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button onClick={() => { if (email.trim()) { onAdd(email.trim()); onClose(); } }}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">Add Email</button>
                </div>
            </div>
        </div>
    );
}

// ── KPI Card ──
function KpiCard({ label, value, icon: Icon, color, sub, highlight, dark }: {
    label: string; value: number | string; icon: any; color: string; sub?: string; highlight?: boolean; dark?: boolean;
}) {
    return (
        <div className={`border rounded-2xl p-5 shadow-sm transition-colors ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} ${highlight ? (dark ? "ring-1 ring-emerald-500" : "border-emerald-200 ring-1 ring-emerald-100") : ""}`}>
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
            </div>
            <div className={`text-3xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
            {sub && <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>}
        </div>
    );
}

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-500">{p.name}:</span>
                    <span className="font-semibold text-gray-800">{(p.value ?? 0).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

function Card({ title, children, dark, action }: { title: string; children: React.ReactNode; dark?: boolean; action?: React.ReactNode }) {
    return (
        <div className={`border rounded-2xl p-6 shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-700"}`}>{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [adminKey, setAdminKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [dark, setDark] = useState(false);

    const [overview, setOverview] = useState<Overview | null>(null);
    const [growth, setGrowth] = useState<GrowthData[]>([]);
    const [skills, setSkills] = useState<{ topTaught: SkillData[]; topWanted: SkillData[] } | null>(null);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userSearch, setUserSearch] = useState("");
    const [engagement, setEngagement] = useState<{ topPosts: TopPost[] } | null>(null);
    const [waitlist, setWaitlist] = useState<{ total: number; recent: WaitlistEntry[] } | null>(null);

    // Modals
    const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void } | null>(null);
    const [editPost, setEditPost] = useState<TopPost | null>(null);
    const [showAddWaitlist, setShowAddWaitlist] = useState(false);

    // Settings state
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const key = sessionStorage.getItem("swapifhy_admin_key");
            if (!key) { router.replace("/admin/login"); return; }
            setAdminKey(key);
            const savedDark = localStorage.getItem("admin_dark") === "true";
            setDark(savedDark);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") localStorage.setItem("admin_dark", String(dark));
    }, [dark]);

    const apiFetch = useCallback(async (endpoint: string, options?: RequestInit) => {
        if (!adminKey) return null;
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: { "x-admin-key": adminKey, "Content-Type": "application/json", ...(options?.headers || {}) }
            });
            if (res.status === 401) { sessionStorage.removeItem("swapifhy_admin_key"); router.replace("/admin/login"); return null; }
            if (!res.ok) return null;
            return res.json();
        } catch { return null; }
    }, [adminKey]);

    const loadOverview = useCallback(async () => { const d = await apiFetch("/api/admin/overview"); if (d) setOverview(d); }, [apiFetch]);
    const loadGrowth = useCallback(async () => { const d = await apiFetch("/api/admin/growth"); if (d) setGrowth(d.chartData); }, [apiFetch]);
    const loadSkills = useCallback(async () => { const d = await apiFetch("/api/admin/skills"); if (d) setSkills(d); }, [apiFetch]);
    const loadUsers = useCallback(async (page = 1, search = "") => {
        const q = search ? `&search=${encodeURIComponent(search)}` : "";
        const d = await apiFetch(`/api/admin/users?page=${page}&limit=15${q}`);
        if (d) { setUsers(d.users); setTotalUsers(d.total); setUserPage(d.page); setUserTotalPages(d.totalPages); }
    }, [apiFetch]);
    const loadEngagement = useCallback(async () => { const d = await apiFetch("/api/admin/engagement"); if (d) setEngagement(d); }, [apiFetch]);
    const loadWaitlist = useCallback(async () => { const d = await apiFetch("/api/admin/waitlist"); if (d) setWaitlist(d); }, [apiFetch]);

    useEffect(() => {
        if (!adminKey) return;
        setLoading(true);
        Promise.all([loadOverview(), loadGrowth()]).finally(() => setLoading(false));
    }, [adminKey]);

    useEffect(() => {
        if (!adminKey) return;
        if (activeTab === "skills" && !skills) loadSkills();
        if (activeTab === "users" && users.length === 0) loadUsers(1);
        if (activeTab === "activity" && !engagement) loadEngagement();
        if (activeTab === "waitlist" && !waitlist) loadWaitlist();
    }, [activeTab, adminKey]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadOverview(), loadGrowth(),
            activeTab === "skills" ? loadSkills() : Promise.resolve(),
            activeTab === "users" ? loadUsers(userPage, userSearch) : Promise.resolve(),
            activeTab === "activity" ? loadEngagement() : Promise.resolve(),
            activeTab === "waitlist" ? loadWaitlist() : Promise.resolve(),
        ]);
        setRefreshing(false);
    };

    const handleLogout = () => { sessionStorage.removeItem("swapifhy_admin_key"); router.push("/admin/login"); };

    // ── User actions ──
    const handleDeleteUser = (u: UserRow) => {
        setConfirm({
            open: true,
            title: "Delete User",
            message: `Permanently delete "${u.name}" (${u.email})? This cannot be undone.`,
            confirmLabel: "Delete Forever",
            onConfirm: async () => {
                await apiFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
                setUsers(prev => prev.filter(x => x.id !== u.id));
                setTotalUsers(p => p - 1);
                setConfirm(null);
            }
        });
    };

    const handleBanUser = (u: UserRow) => {
        const isBanned = u.isBanned;
        setConfirm({
            open: true,
            title: isBanned ? "Unban User" : "Ban User",
            message: isBanned
                ? `Restore access for "${u.name}"?`
                : `Ban "${u.name}" (${u.email})? They will be locked out immediately.`,
            confirmLabel: isBanned ? "Unban" : "Ban User",
            danger: !isBanned,
            onConfirm: async () => {
                await apiFetch(`/api/admin/users/${u.id}/ban`, { method: "PUT", body: JSON.stringify({ banned: !isBanned }) });
                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isBanned: !isBanned } : x));
                setConfirm(null);
            }
        });
    };

    // ── Post actions ──
    const handleDeletePost = (p: TopPost) => {
        setConfirm({
            open: true,
            title: "Delete Post",
            message: `Delete this post by "${p.author}"? This cannot be undone.`,
            confirmLabel: "Delete Post",
            onConfirm: async () => {
                await apiFetch(`/api/admin/posts/${p.id}`, { method: "DELETE" });
                setEngagement(prev => prev ? { ...prev, topPosts: prev.topPosts.filter(x => x.id !== p.id) } : prev);
                setConfirm(null);
            }
        });
    };

    const handleSavePost = async (id: string, content: string) => {
        await apiFetch(`/api/admin/posts/${id}`, { method: "PUT", body: JSON.stringify({ content }) });
        setEngagement(prev => prev ? {
            ...prev,
            topPosts: prev.topPosts.map(p => p.id === id ? { ...p, preview: content.slice(0, 100), content } : p)
        } : prev);
    };

    // ── Waitlist actions ──
    const handleAddWaitlist = async (email: string) => {
        const d = await apiFetch("/api/admin/waitlist", { method: "POST", body: JSON.stringify({ email }) });
        if (d) loadWaitlist();
    };

    const handleRemoveWaitlist = (entry: WaitlistEntry) => {
        setConfirm({
            open: true,
            title: "Remove from Waitlist",
            message: `Remove "${entry.email}" from the waitlist?`,
            confirmLabel: "Remove",
            onConfirm: async () => {
                await apiFetch(`/api/admin/waitlist/${entry.id || encodeURIComponent(entry.email)}`, { method: "DELETE" });
                loadWaitlist();
                setConfirm(null);
            }
        });
    };

    if (!adminKey || loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Loading dashboard…</p>
                </div>
            </div>
        );
    }

    const funnelData = overview ? FUNNEL_LABELS.map((l, i) => ({ name: l, value: overview.swapFunnel[l], color: FUNNEL_COLORS[i] })) : [];

    const bg = dark ? "bg-gray-950" : "bg-gray-50";
    const sidebar = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
    const text = dark ? "text-white" : "text-gray-900";
    const subtext = dark ? "text-gray-400" : "text-gray-500";
    const navActive = dark ? "bg-gray-800 text-indigo-400" : "bg-indigo-50 text-indigo-700";
    const navIdle = dark ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50";
    const tableHead = dark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-500";
    const tableRow = dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-100 hover:bg-gray-50";
    const inputCls = dark
        ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400";

    return (
        <div className={`min-h-screen ${bg} font-sans ${text} flex`}>
            <Head><title>Admin Dashboard — Swapifhy</title><meta name="robots" content="noindex" /></Head>

            {/* Modals */}
            {confirm && (
                <ConfirmModal
                    open={confirm.open}
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.confirmLabel}
                    danger={(confirm as any).danger !== false}
                    onConfirm={confirm.onConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}
            {editPost && <EditPostModal post={editPost} onSave={handleSavePost} onClose={() => setEditPost(null)} />}
            {showAddWaitlist && <AddWaitlistModal onAdd={handleAddWaitlist} onClose={() => setShowAddWaitlist(false)} />}

            {/* SIDEBAR */}
            <aside className={`w-64 shrink-0 border-r flex flex-col min-h-screen sticky top-0 ${sidebar}`}>
                <div className={`px-6 py-6 flex items-center gap-3 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
                    <img src="https://www.swapifhy.com/assets/swapifhy-logo-DPxPDdg-.png" alt="logo" className="w-8 h-8 object-contain" />
                    <div>
                        <p className={`font-bold leading-none ${text}`}>Swapifhy</p>
                        <p className={`text-xs mt-1 ${subtext}`}>Admin</p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? navActive : navIdle}`}>
                                <Icon className="w-4 h-4" /> {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className={`p-3 border-t space-y-1 ${dark ? "border-gray-800" : "border-gray-100"}`}>
                    {/* Dark mode toggle */}
                    <button onClick={() => setDark(d => !d)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${navIdle}`}>
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {dark ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button onClick={handleRefresh} disabled={refreshing}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${navIdle}`}>
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
                    </button>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-4 h-4" /> Log out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 px-8 py-8 max-w-[1300px] overflow-x-hidden">

                {/* OVERVIEW */}
                {activeTab === "overview" && overview && (
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${text}`}>Overview</h1>
                        <p className={`text-sm mb-8 ${subtext}`}>A snapshot of everything happening on Swapifhy.</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <KpiCard dark={dark} label="Active Now" value={overview.activeNow ?? 0} icon={Wifi} color="#10b981" sub="Active in last 5 min" highlight />
                            <KpiCard dark={dark} label="Total Users" value={overview.totalUsers} icon={Users} color="#6366f1" sub="Registered accounts" />
                            <KpiCard dark={dark} label="Waitlist" value={overview.totalWaitlist} icon={Mail} color="#8b5cf6" sub="Waiting for access" />
                            <KpiCard dark={dark} label="Total Swaps" value={overview.totalSwaps} icon={Repeat2} color="#22d3ee" sub="Skill exchanges started" />
                            <KpiCard dark={dark} label="Posts" value={overview.totalPosts} icon={FileText} color="#0ea5e9" />
                            <KpiCard dark={dark} label="Likes" value={overview.totalLikes} icon={Heart} color="#ef4444" />
                            <KpiCard dark={dark} label="Comments" value={overview.totalComments} icon={MessageSquare} color="#f59e0b" />
                            <KpiCard dark={dark} label="Follows" value={overview.totalFollows} icon={UserPlus} color="#3b82f6" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card dark={dark} title="New users & waitlist (last 30 days)">
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={growth}>
                                                <defs>
                                                    <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                                                    <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? "#374151" : "#f1f1f4"} />
                                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: dark ? "#6b7280" : "#9ca3af" }} tickLine={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: dark ? "#6b7280" : "#9ca3af" }} tickLine={false} axisLine={false} width={28} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Area type="monotone" dataKey="users" name="New users" stroke="#6366f1" strokeWidth={2.5} fill="url(#gU)" />
                                                <Area type="monotone" dataKey="waitlist" name="Waitlist" stroke="#22d3ee" strokeWidth={2.5} fill="url(#gW)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                            <Card dark={dark} title="Swap status">
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={funnelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                                {funnelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {funnelData.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                                            <span className={`capitalize ${subtext}`}>{d.name.toLowerCase()}</span>
                                            <span className={`font-semibold ml-auto ${text}`}>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* USERS */}
                {activeTab === "users" && (
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${text}`}>Users</h1>
                        <p className={`text-sm mb-6 ${subtext}`}>{totalUsers.toLocaleString()} registered accounts.</p>

                        {/* Search */}
                        <div className="relative mb-4 max-w-sm">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtext}`} />
                            <input type="text" placeholder="Search by name or email..." value={userSearch}
                                onChange={e => { setUserSearch(e.target.value); loadUsers(1, e.target.value); }}
                                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`} />
                        </div>

                        <div className={`border rounded-2xl overflow-hidden shadow-sm ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-medium uppercase tracking-wider ${tableHead}`}>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Rep</th>
                                        <th className="px-6 py-3">Swaps</th>
                                        <th className="px-6 py-3">Posts</th>
                                        <th className="px-6 py-3">Joined</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${dark ? "divide-gray-700" : "divide-gray-100"}`}>
                                    {users.map(u => (
                                        <tr key={u.id} className={`transition-colors ${tableRow}`}>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center overflow-hidden shrink-0 font-semibold text-sm">
                                                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt="" /> : u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-medium truncate ${text}`}>{u.name}</p>
                                                        <p className={`text-xs truncate ${subtext}`}>{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-3 ${text}`}>
                                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{u.reputation}</span>
                                            </td>
                                            <td className={`px-6 py-3 ${subtext}`}>{u.swapCount}</td>
                                            <td className={`px-6 py-3 ${subtext}`}>{u.postCount}</td>
                                            <td className={`px-6 py-3 ${subtext}`}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-3">
                                                {u.isBanned ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-bold uppercase">
                                                        <Ban className="w-3 h-3" /> Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleBanUser(u)} title={u.isBanned ? "Unban" : "Ban"}
                                                        className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}>
                                                        {u.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u)} title="Delete user"
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <p className={`text-sm ${subtext}`}>Page {userPage} of {userTotalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => loadUsers(userPage - 1, userSearch)} disabled={userPage <= 1}
                                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40 ${dark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => loadUsers(userPage + 1, userSearch)} disabled={userPage >= userTotalPages}
                                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40 ${dark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SKILLS */}
                {activeTab === "skills" && (
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${text}`}>Skills</h1>
                        <p className={`text-sm mb-6 ${subtext}`}>What people want to teach and learn.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card dark={dark} title="Top skills offered (teach)">
                                {skills?.topTaught?.length ? skills.topTaught.map((s, i) => (
                                    <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-50"}`}>
                                        <span className={`text-sm capitalize ${text}`}>{s.skill}</span>
                                        <span className="text-sm font-semibold text-indigo-500">{s.count}</span>
                                    </div>
                                )) : <p className={`text-sm ${subtext}`}>No data yet.</p>}
                            </Card>
                            <Card dark={dark} title="Top skills wanted (learn)">
                                {skills?.topWanted?.length ? skills.topWanted.map((s, i) => (
                                    <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-50"}`}>
                                        <span className={`text-sm capitalize ${text}`}>{s.skill}</span>
                                        <span className="text-sm font-semibold text-cyan-500">{s.count}</span>
                                    </div>
                                )) : <p className={`text-sm ${subtext}`}>No data yet.</p>}
                            </Card>
                        </div>
                    </div>
                )}

                {/* ACTIVITY — Posts with edit/delete */}
                {activeTab === "activity" && (
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${text}`}>Activity</h1>
                        <p className={`text-sm mb-6 ${subtext}`}>Most engaged posts on the platform.</p>
                        <Card dark={dark} title="Top posts">
                            {engagement?.topPosts?.length ? engagement.topPosts.map(p => (
                                <div key={p.id} className={`flex items-start justify-between gap-4 py-4 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-50"}`}>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm truncate mb-1 ${text}`}>{p.preview}</p>
                                        <p className={`text-xs ${subtext}`}>by {p.author} · {new Date(p.createdAt).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="flex items-center gap-1 text-red-400"><Heart className="w-3.5 h-3.5" /> {p.likes}</span>
                                            <span className="flex items-center gap-1 text-amber-400"><MessageSquare className="w-3.5 h-3.5" /> {p.comments}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}>{p.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => setEditPost(p)} title="Edit post"
                                            className={`p-1.5 rounded-lg transition-colors ${dark ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeletePost(p)} title="Delete post"
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : <p className={`text-sm ${subtext}`}>No posts yet.</p>}
                        </Card>
                    </div>
                )}

                {/* WAITLIST — with add/remove */}
                {activeTab === "waitlist" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className={`text-2xl font-bold mb-1 ${text}`}>Waitlist</h1>
                                <p className={`text-sm ${subtext}`}>{(waitlist?.total ?? 0).toLocaleString()} people on the waitlist.</p>
                            </div>
                            <button onClick={() => setShowAddWaitlist(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm">
                                <Plus className="w-4 h-4" /> Add Email
                            </button>
                        </div>
                        <Card dark={dark} title="Most recent signups">
                            {waitlist?.recent?.length ? waitlist.recent.map((w, i) => (
                                <div key={i} className={`flex items-center justify-between py-3 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-50"} group`}>
                                    <span className={`flex items-center gap-2 text-sm ${text}`}>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {w.email}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs ${subtext}`}>{new Date(w.createdAt).toLocaleDateString()}</span>
                                        <button onClick={() => handleRemoveWaitlist(w)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )) : <p className={`text-sm ${subtext}`}>No waitlist entries.</p>}
                        </Card>
                    </div>
                )}

                {/* SETTINGS */}
                {activeTab === "settings" && (
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${text}`}>Settings</h1>
                        <p className={`text-sm mb-8 ${subtext}`}>Platform configuration and admin controls.</p>

                        <div className="space-y-6">
                            {/* Appearance */}
                            <Card dark={dark} title="Appearance">
                                <div className={`flex items-center justify-between py-3 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
                                    <div>
                                        <p className={`text-sm font-medium ${text}`}>Dark Mode</p>
                                        <p className={`text-xs ${subtext}`}>Toggle between light and dark admin interface</p>
                                    </div>
                                    <button onClick={() => setDark(d => !d)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${dark ? "bg-indigo-600" : "bg-gray-200"}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${dark ? "translate-x-6" : "translate-x-0.5"}`} />
                                    </button>
                                </div>
                            </Card>

                            {/* Platform Controls */}
                            <Card dark={dark} title="Platform Controls">
                                <div className={`flex items-center justify-between py-4 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
                                    <div>
                                        <p className={`text-sm font-medium ${text}`}>Allow New Registrations</p>
                                        <p className={`text-xs ${subtext}`}>When disabled, new users cannot sign up</p>
                                    </div>
                                    <button onClick={() => setAllowRegistrations(r => !r)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${allowRegistrations ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${allowRegistrations ? "translate-x-6" : "translate-x-0.5"}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <p className={`text-sm font-medium ${text}`}>Maintenance Mode</p>
                                        <p className={`text-xs ${subtext}`}>Show a maintenance page to all non-admin users</p>
                                    </div>
                                    <button onClick={() => setMaintenanceMode(m => !m)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${maintenanceMode ? "translate-x-6" : "translate-x-0.5"}`} />
                                    </button>
                                </div>
                            </Card>

                            {/* Security */}
                            <Card dark={dark} title="Security">
                                <div className={`flex items-center justify-between py-4 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                            <Key className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${text}`}>Admin Key</p>
                                            <p className={`text-xs ${subtext}`}>Rotate your admin access key</p>
                                        </div>
                                    </div>
                                    <button className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${dark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                        Rotate Key
                                    </button>
                                </div>
                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${text}`}>Banned Users</p>
                                            <p className={`text-xs ${subtext}`}>View and manage all banned accounts</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setActiveTab("users"); setUserSearch(""); }}
                                        className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
                                        View Users
                                    </button>
                                </div>
                            </Card>

                            {/* Danger Zone */}
                            <Card dark={dark} title="Danger Zone">
                                <div className={`p-4 rounded-xl border ${dark ? "border-red-800 bg-red-900/10" : "border-red-100 bg-red-50"}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-red-600">Clear All Posts</p>
                                            <p className={`text-xs mt-0.5 ${subtext}`}>Permanently delete all user posts from the platform</p>
                                        </div>
                                        <button onClick={() => setConfirm({
                                            open: true,
                                            title: "Clear All Posts",
                                            message: "This will permanently delete ALL posts. This cannot be undone.",
                                            confirmLabel: "Delete All Posts",
                                            onConfirm: async () => {
                                                await apiFetch("/api/admin/posts/all", { method: "DELETE" });
                                                setEngagement(null);
                                                setConfirm(null);
                                            }
                                        })} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                                            Clear Posts
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            {/* Save */}
                            <div className="flex items-center justify-between">
                                {settingsSaved && (
                                    <span className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Settings saved
                                    </span>
                                )}
                                <div className="ml-auto">
                                    <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm">
                                        <Save className="w-4 h-4" /> Save Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
