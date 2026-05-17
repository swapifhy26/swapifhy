import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Settings, PenTool, BookOpen, ArrowRight, Zap, User, Globe, Sparkles } from "lucide-react";
import { Loader } from "../components/ui/Loader";
import { SwapifhyLogo } from "../components/SwapifhyLogo";
import { API_URL } from "../lib/api";

const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
];

import { SkillTagManager } from "../components/SkillTagManager";

export default function Dashboard() {
    const [bio, setBio] = useState("");
    const [hobbies, setHobbies] = useState("");
    const [teachSkills, setTeachSkills] = useState<string[]>([]);
    const [learnSkills, setLearnSkills] = useState<string[]>([]);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [instagram, setInstagram] = useState("");
    const [otherLink, setOtherLink] = useState("");
    const [privacy, setPrivacy] = useState("PUBLIC");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAvatarAlt, setShowAvatarAlt] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }
        
        const fetchProfile = fetch(`${API_URL}/api/user/profile`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
        const fetchSuggestions = fetch(`${API_URL}/api/match/explore`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
        const fetchConversations = fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());

        Promise.all([fetchProfile, fetchSuggestions, fetchConversations])
            .then(([profileData, matchData, chatData]) => {
                if (profileData.user) {
                    setName(profileData.user.name);
                    setBio(profileData.user.bio || "");
                    setHobbies(profileData.user.hobbies || "");
                    setAvatarUrl(profileData.user.avatarUrl || "");
                    setPhoneNumber(profileData.user.phoneNumber || "");
                    setGithub(profileData.user.github || "");
                    setLinkedin(profileData.user.linkedin || "");
                    setInstagram(profileData.user.instagram || "");
                    setOtherLink(profileData.user.otherLink || "");
                    setPrivacy(profileData.user.privacy || "PUBLIC");
                    setTeachSkills(profileData.user.teachSkills?.map((s: any) => s.name) || []);
                    setLearnSkills(profileData.user.learnSkills?.map((s: any) => s.name) || []);
                }
                if (matchData?.matches) {
                    setSuggestions(matchData.matches.slice(0, 3));
                }
                if (chatData?.conversations) {
                    setConversations(chatData.conversations);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = localStorage.getItem("swapifhy_token");
                const res = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setAvatarUrl(data.url);
                // AUTO-SYNC IDENTITY NODE
                handleSave(undefined, data.url);
            }
        } catch (error) {
            console.error("Identity sync failure:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent, overrideAvatar?: string) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
                const res = await fetch(`${API_URL}/api/user/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ 
                    name,
                    bio, 
                    hobbies,
                    avatarUrl: overrideAvatar || avatarUrl, 
                    phoneNumber,
                    github,
                    linkedin,
                    instagram,
                    otherLink,
                    privacy,
                    teach: teachSkills.join(","), 
                    learn: learnSkills.join(",") 
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setBio(data.user.bio || "");
                    setHobbies(data.user.hobbies || "");
                    setAvatarUrl(data.user.avatarUrl || "");
                    setPhoneNumber(data.user.phoneNumber || "");
                    setGithub(data.user.github || "");
                    setLinkedin(data.user.linkedin || "");
                    setInstagram(data.user.instagram || "");
                    setOtherLink(data.user.otherLink || "");
                    setPrivacy(data.user.privacy || "PUBLIC");
                    setTeachSkills(data.user.teachSkills?.map((s: any) => s.name) || []);
                    setLearnSkills(data.user.learnSkills?.map((s: any) => s.name) || []);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden">
            {/* Restored Obsidian Elite Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb orb-blue opacity-10 top-[-10%] left-[-10%]" />
                <div className="mesh-orb orb-pink opacity-5 bottom-[-10%] right-[-10%]" />
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl mx-auto px-6 pb-40 relative z-10 pt-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg text-primary text-[9px] font-black uppercase tracking-[0.5em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> // Identity Node Operational</div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-white mb-6 uppercase italic leading-none">
                            OPERATIONAL <span className="text-gradient-elite font-tech">CONTROL CENTER</span>
                        </h1>
                        <p className="text-muted text-sm max-w-xl font-medium tracking-tight leading-relaxed uppercase opacity-60">
                            Protocol Alpha V4.4 // Secure Identity Management Interface
                        </p>
                    </div>
                    <div className="flex gap-6">
                        {[
                            { label: "Stability", val: "98%", color: "text-primary" },
                            { label: "Sync Rank", val: "#12", color: "text-secondary" }
                        ].map((s, i) => (
                            <div key={i} className="px-10 py-8 rounded-[2.5rem] glass-card border-border flex flex-col items-center justify-center min-w-[160px] group hover:border-primary/20 transition-all">
                                <span className={`text-4xl font-mono font-black ${s.color} group-hover:scale-110 transition-transform`}>{s.val}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-40">{s.label === "Stability" ? "SYNC RELIABILITY" : "GLOBAL STANDING"}</span>
                            </div>
                        ))}
                    </div>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Inbound Sync Matrix (Inbox) */}
                    <div className="p-10 md:p-14 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><Zap className="w-32 h-32" /></div>
                        <h2 className="text-sm font-tech font-black mb-10 flex items-center gap-4 text-foreground uppercase tracking-[0.4em] relative z-10">
                            <Sparkles className="text-primary w-5 h-5" /> INBOUND QUEUE & SYNC PIPELINES
                        </h2>

                        <div className="space-y-6 relative z-10">
                            {conversations.length > 0 ? (
                                conversations.slice(0, 3).map((conv, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer" onClick={() => router.push(`/matches`)}>
                                        <div className="w-16 h-16 rounded-2xl bg-surface border border-border overflow-hidden shrink-0">
                                            {conv.partnerAvatar ? <img src={conv.partnerAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs">{conv.partnerName.charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-1 line-clamp-1">{conv.partnerName}</h4>
                                            <p className="text-xs text-muted-foreground font-medium truncate mb-2">{conv.lastMessage}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">Protocol Ready</span>
                                                <span className="text-[8px] font-medium text-muted-foreground/40">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Sync Requests Detected</p>
                                </div>
                            )}
                            
                            <div className="pt-6 border-t border-border flex justify-center">
                                <button onClick={() => router.push("/matches")} className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.4em] transition-all">View Full Identity Matrix ✧</button>
                            </div>
                        </div>
                    </div>

                    {/* Identity Matrix Configuration */}
                    <div className="p-10 md:p-14 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl">
                        <h2 className="text-sm font-tech font-black mb-10 flex items-center gap-4 text-foreground uppercase tracking-[0.4em] relative z-10">
                            <User className="text-primary w-5 h-5" /> PRIMARY IDENTITY PARAMETERS
                        </h2>

                        <div className="space-y-12 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Legal Identity Node</label>
                                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-surface border border-border rounded-2xl py-4 px-8 text-foreground placeholder:text-muted/10 focus:outline-none focus:border-primary/50 transition-all font-tech" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Privacy Protocol Tiers</label>
                                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                                        {["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"].map((tier) => (
                                            <button 
                                                key={tier}
                                                onClick={() => setPrivacy(tier)}
                                                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${privacy === tier ? "bg-primary text-black" : "text-muted-foreground hover:text-white"}`}
                                            >
                                                {tier.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Bio-Signature Synthesis</label>
                                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Summarize your professional essence..." rows={4} className="w-full bg-surface border border-border rounded-[2rem] py-6 px-8 text-foreground placeholder:text-muted/20 focus:outline-none focus:border-primary/50 transition-all resize-none font-medium text-base shadow-inner" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Hobbies & Interests</label>
                                    <textarea value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="What do you enjoy doing outside of work?" rows={4} className="w-full bg-surface border border-border rounded-[2rem] py-6 px-8 text-foreground placeholder:text-muted/20 focus:outline-none focus:border-secondary/50 transition-all resize-none font-medium text-base shadow-inner" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <SkillTagManager 
                                    title="Outbound Acquisition (Teaching)" 
                                    tags={teachSkills} 
                                    onUpdate={setTeachSkills} 
                                    color="bg-primary/10 border-primary/20 text-primary"
                                />
                                <SkillTagManager 
                                    title="Inbound Transformation (Learning)" 
                                    tags={learnSkills} 
                                    onUpdate={setLearnSkills} 
                                    color="bg-secondary/10 border-secondary/20 text-secondary"
                                />
                            </div>

                            <div className="pt-8 border-t border-border flex items-center justify-between">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">// CRUD Operations Synchronized in Real-time</p>
                                <button onClick={() => handleSave()} disabled={saving} className="btn-gradient px-14 py-5 text-xs font-black uppercase tracking-[0.4em]">
                                    {saving ? "INITIALIZING..." : "Save Identity Signature"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Professional Footprint (Socials) */}
                    <div className="p-10 md:p-14 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl">
                        <h2 className="text-sm font-tech font-black mb-10 flex items-center gap-4 text-foreground uppercase tracking-[0.4em] relative z-10">
                            <Globe className="text-secondary w-5 h-5" /> EXTERNAL NETWORK BRIDGES
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">GitHub Node</label>
                                <input value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/yourhandle" className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted/10 focus:outline-none focus:border-primary/50 transition-all text-xs" />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">LinkedIn Bridge</label>
                                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/handle" className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted/10 focus:outline-none focus:border-primary/50 transition-all text-xs" />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Instagram Feed</label>
                                <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@handle" className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted/10 focus:outline-none focus:border-secondary/50 transition-all text-xs" />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Phone Signature (PII Protected)</label>
                                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 234 567 890" className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted/10 focus:outline-none focus:border-foreground/50 transition-all text-xs" />
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-border flex items-center justify-between relative z-10">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">// Operational Link Bridges Active</p>
                            <button onClick={() => handleSave()} disabled={saving} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.4em] hover:bg-white/10 hover:border-secondary/40 transition-all active:scale-95 disabled:opacity-50">
                                {saving ? "SYNCHING..." : "Synchronize Footprint"}
                            </button>
                        </div>
                    </div>

                    {/* Secondary Analytics Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[3rem] glass-card border-border flex flex-col justify-center gap-4">
                             <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">Network Influence</h4>
                                    <span className="text-3xl font-black text-white">2.4k</span>
                                </div>
                                <div className="flex gap-1 h-12 items-end">
                                    {[0.4, 0.7, 0.5, 0.9, 0.6, 1.0, 0.8].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-primary/40 rounded-full" style={{ height: `${h * 100}%` }} />
                                    ))}
                                </div>
                             </div>
                        </div>
                        <div className="p-10 rounded-[3rem] glass-card border-white/5 flex flex-col justify-center gap-4">
                             <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">Sync Efficiency</h4>
                                    <span className="text-3xl font-black text-white">A+</span>
                                </div>
                                <div className="text-secondary animate-pulse px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-[9px] font-black uppercase tracking-widest">Optimal</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Profile Visual ID */}
                <div className="space-y-12">
                    <div className="p-12 rounded-[3.5rem] glass-card border-white/10 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                        <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 shadow-inner flex items-center justify-center mb-10 relative overflow-hidden group cursor-pointer" onClick={() => setShowAvatarAlt(!showAvatarAlt)}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-6xl">💠</span>
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PenTool className="text-white w-8 h-8" />
                            </div>
                        </div>

                        {showAvatarAlt && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-50 p-10 flex flex-col items-center justify-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8">Select Visual ID Node</h4>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {AVATARS.map((url, i) => (
                                        <button key={i} onClick={() => { setAvatarUrl(url); setShowAvatarAlt(false); }} className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 hover:border-primary transition-all">
                                            <img src={url} className="w-full h-full object-cover" alt="avatar-preset" />
                                        </button>
                                    ))}
                                </div>
                                <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Or paste image URL..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white text-[10px] focus:outline-none focus:border-primary/50 transition-all mb-6" />
                                
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full py-4 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all mb-8 shadow-xl shadow-primary/20"
                                >
                                    {uploading ? "SYNCHRONIZING..." : "Synchronize Original Image"}
                                </button>

                                <button onClick={() => setShowAvatarAlt(false)} className="text-[10px] font-black text-muted-foreground uppercase hover:text-white">Close X</button>
                            </motion.div>
                        )}

                        <h3 className="text-3xl font-heading font-black mb-3 text-foreground tracking-tighter uppercase leading-none">{name.split(" ")[0]}</h3>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-10 italic">Core Architect</p>
                        
                        <div className="w-full space-y-6 pt-10 border-t border-white/5">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Knowledge IQ</span>
                                <span className="text-white font-black text-xl italic leading-none">142.5</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full p-0.5"><div className="h-full bg-primary rounded-full w-[85%] shadow-[0_0_15px_rgba(99,102,241,0.6)]" /></div>
                        </div>
                    </div>

                    {/* Network Health Stats */}
                    <div className="p-12 rounded-[3rem] glass-card border-white/5 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><BookOpen className="w-40 h-40" /></div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2 opacity-60">Identity Integrity</h4>
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-[11px] font-medium leading-relaxed italic text-center">
                                "The matrix requires your identity to be fully documented for maximum synergy synchronization."
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest">Protocol Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
        </div>
    );
}
