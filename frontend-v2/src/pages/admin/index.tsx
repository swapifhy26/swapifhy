import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
    Users, Repeat2, FileText, Heart, MessageSquare, UserPlus, Mail,
    LayoutDashboard, RefreshCw, LogOut, Star, Activity, ChevronLeft,
    ChevronRight, CheckCircle2, Wifi
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, CartesianGrid
} from "recharts";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Overview {
    totalUsers: number;
    totalSwaps: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalFollows: number;
    totalWaitlist: number;
    activeNow: number;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

const FUNNEL_COLORS = ["#6366f1", "#10b981", "#22d3ee", "#ef4444"];
const FUNNEL_LABELS: Array<keyof Overview["swapFunnel"]> = ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED"];

const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "skills", label: "Skills", icon: Star },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "waitlist", label: "Waitlist", icon: Mail },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, sub, highlight }: {
    label: string; value: number | string; icon: any; color: string; sub?: string; highlight?: boolean;
}) {
    return (
        <div className={`bg-white border rounded-2xl p-5 shadow-sm ${highlight ? "border-emerald-200 ring-1 ring-emerald-100" : "border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</div>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">{title}</h3>
            {children}
        </div>
    );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const router = useRouter();
    const [adminKey, setAdminKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [overview, setOverview] = useState<Overview | null>(null);
    const [growth, setGrowth] = useState<GrowthData[]>([]);
    const [skills, setSkills] = useState<{ topTaught: SkillData[]; topWanted: SkillData[] } | null>(null);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [engagement, setEngagement] = useState<{ topPosts: TopPost[] } | null>(null);
    const [waitlist, setWaitlist] = useState<{ total: number; recent: WaitlistEntry[] } | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const key = sessionStorage.getItem("swapifhy_admin_key");
            if (!key) { router.replace("/admin/login"); return; }
            setAdminKey(key);
        }
    }, []);

    const apiFetch = useCallback(async (endpoint: string) => {
        if (!adminKey) return null;
        try {
            const res = await fetch(`${API_URL}${endpoint}`, { headers: { "x-admin-key": adminKey } });
            if (res.status === 401) { sessionStorage.removeItem("swapifhy_admin_key"); router.replace("/admin/login"); return null; }
            if (!res.ok) return null;
            return res.json();
        } catch { return null; }
    }, [adminKey]);

    const loadOverview = useCallback(async () => { const d = await apiFetch("/api/admin/overview"); if (d) setOverview(d); }, [apiFetch]);
    const loadGrowth = useCallback(async () => { const d = await apiFetch("/api/admin/growth"); if (d) setGrowth(d.chartData); }, [apiFetch]);
    const loadSkills = useCallback(async () => { const d = await apiFetch("/api/admin/skills"); if (d) setSkills(d); }, [apiFetch]);
    const loadUsers = useCallback(async (page = 1) => {
        const d = await apiFetch(`/api/admin/users?page=${page}&limit=15`);
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
        await Promise.all([loadOverview(), loadGrowth(),
            activeTab === "skills" ? loadSkills() : Promise.resolve(),
            activeTab === "users" ? loadUsers(userPage) : Promise.resolve(),
            activeTab === "activity" ? loadEngagement() : Promise.resolve(),
            activeTab === "waitlist" ? loadWaitlist() : Promise.resolve(),
        ]);
        setRefreshing(false);
    };

    const handleLogout = () => { sessionStorage.removeItem("swapifhy_admin_key"); router.push("/admin/login"); };

    if (!adminKey || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    const funnelData = overview ? FUNNEL_LABELS.map((l, i) => ({ name: l, value: overview.swapFunnel[l], color: FUNNEL_COLORS[i] })) : [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
            <Head><title>Admin Dashboard — Swapifhy</title><meta name="robots" content="noindex" /></Head>

            {/* SIDEBAR */}
            <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0">
                <div className="px-6 py-6 flex items-center gap-3 border-b border-gray-100">
                    <img src="https://www.swapifhy.com/assets/swapifhy-logo-DPxPDdg-.png" alt="logo" className="w-8 h-8 object-contain" />
                    <div>
                        <p className="font-bold text-gray-900 leading-none">Swapifhy</p>
                        <p className="text-xs text-gray-400 mt-1">Admin</p>
                    </div>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                                <Icon className="w-4 h-4" /> {item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-gray-100 space-y-1">
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
                    </button>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Log out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 px-8 py-8 max-w-[1300px]">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
                        <p className="text-gray-500 text-sm mb-8">A snapshot of everything happening on Swapifhy.</p>
                        {overview && (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <KpiCard label="Active Now" value={overview.activeNow ?? 0} icon={Wifi} color="#10b981" sub="Active in the last 5 minutes" highlight />
                                    <KpiCard label="Total Users" value={overview.totalUsers} icon={Users} color="#6366f1" sub="Registered accounts" />
                                    <KpiCard label="Waitlist" value={overview.totalWaitlist} icon={Mail} color="#8b5cf6" sub="People waiting for access" />
                                    <KpiCard label="Total Swaps" value={overview.totalSwaps} icon={Repeat2} color="#22d3ee" sub="Skill exchanges started" />
                                    <KpiCard label="Posts" value={overview.totalPosts} icon={FileText} color="#0ea5e9" />
                                    <KpiCard label="Likes" value={overview.totalLikes} icon={Heart} color="#ef4444" />
                                    <KpiCard label="Comments" value={overview.totalComments} icon={MessageSquare} color="#f59e0b" />
                                    <KpiCard label="Follows" value={overview.totalFollows} icon={UserPlus} color="#3b82f6" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <Card title="New users & waitlist (last 30 days)">
                                            <div className="h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={growth}>
                                                        <defs>
                                                            <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                                                            <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                                                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={28} />
                                                        <Tooltip content={<ChartTooltip />} />
                                                        <Area type="monotone" dataKey="users" name="New users" stroke="#6366f1" strokeWidth={2.5} fill="url(#gU)" />
                                                        <Area type="monotone" dataKey="waitlist" name="Waitlist" stroke="#22d3ee" strokeWidth={2.5} fill="url(#gW)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </div>
                                    <Card title="Swap status">
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
                                                    <span className="text-gray-500 capitalize">{d.name.toLowerCase()}</span>
                                                    <span className="font-semibold text-gray-800 ml-auto">{d.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* USERS */}
                {activeTab === "users" && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
                        <p className="text-gray-500 text-sm mb-6">{totalUsers.toLocaleString()} registered accounts.</p>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Reputation</th>
                                        <th className="px-6 py-3 font-medium">Swaps</th>
                                        <th className="px-6 py-3 font-medium">Posts</th>
                                        <th className="px-6 py-3 font-medium">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center overflow-hidden shrink-0 font-semibold">
                                                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt="" /> : u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{u.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1 text-gray-700"><Star className="w-3.5 h-3.5 text-amber-400" /> {u.reputation}</span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">{u.swapCount}</td>
                                            <td className="px-6 py-3 text-gray-600">{u.postCount}</td>
                                            <td className="px-6 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-400">Page {userPage} of {userTotalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => loadUsers(userPage - 1)} disabled={userPage <= 1}
                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => loadUsers(userPage + 1)} disabled={userPage >= userTotalPages}
                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SKILLS */}
                {activeTab === "skills" && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Skills</h1>
                        <p className="text-gray-500 text-sm mb-6">What people want to teach and learn.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="Top skills offered (teach)">
                                {skills?.topTaught?.length ? skills.topTaught.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-700 capitalize">{s.skill}</span>
                                        <span className="text-sm font-semibold text-indigo-600">{s.count}</span>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No data yet.</p>}
                            </Card>
                            <Card title="Top skills wanted (learn)">
                                {skills?.topWanted?.length ? skills.topWanted.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-700 capitalize">{s.skill}</span>
                                        <span className="text-sm font-semibold text-cyan-600">{s.count}</span>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No data yet.</p>}
                            </Card>
                        </div>
                    </div>
                )}

                {/* ACTIVITY */}
                {activeTab === "activity" && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Activity</h1>
                        <p className="text-gray-500 text-sm mb-6">Most engaged posts on the platform.</p>
                        <Card title="Top posts">
                            {engagement?.topPosts?.length ? engagement.topPosts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{p.preview}</p>
                                        <p className="text-xs text-gray-400">by {p.author} · {new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> {p.likes}</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-amber-400" /> {p.comments}</span>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-400">No posts yet.</p>}
                        </Card>
                    </div>
                )}

                {/* WAITLIST */}
                {activeTab === "waitlist" && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Waitlist</h1>
                        <p className="text-gray-500 text-sm mb-6">{(waitlist?.total ?? 0).toLocaleString()} people on the waitlist.</p>
                        <Card title="Most recent signups">
                            {waitlist?.recent?.length ? waitlist.recent.map((w, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                    <span className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {w.email}</span>
                                    <span className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</span>
                                </div>
                            )) : <p className="text-sm text-gray-400">No waitlist entries.</p>}
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
