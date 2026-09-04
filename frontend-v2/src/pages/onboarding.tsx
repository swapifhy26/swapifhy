import confetti from 'canvas-confetti';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { X, ArrowRight, Sparkles, Zap, MessageSquare } from "lucide-react";
import { API_URL } from "../lib/api";

// Local, theme-aware tag input (the shared SkillTagManager hardcodes dark colors).
function TagField({ label, hint, placeholder, tags, setTags }: {
    label: string; hint: string; placeholder: string; tags: string[]; setTags: (t: string[]) => void;
}) {
    const [input, setInput] = useState("");
    const add = (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            const val = input.trim();
            if (!tags.some(t => t.toLowerCase() === val.toLowerCase())) setTags([...tags, val]);
            setInput("");
        }
    };
    return (
        <div className="space-y-2">
            <div>
                <label className="block text-sm font-semibold text-foreground">{label}</label>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            <div className="flex flex-wrap gap-2 p-3 min-h-[92px] bg-background border border-border rounded-xl content-start focus-within:border-primary/50 transition-colors">
                {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:opacity-60">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={add}
                    placeholder={tags.length === 0 ? placeholder : "Add another…"}
                    className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-foreground text-sm p-1 placeholder:text-muted-foreground/60"
                />
            </div>
        </div>
    );
}

export default function Onboarding() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [teach, setTeach] = useState<string[]>([]);
    const [learn, setLearn] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState("");
    const [magicMatch, setMagicMatch] = useState<any>(null);
    const [showMagicMatch, setShowMagicMatch] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    const [requestingSwap, setRequestingSwap] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    // Guard: need a token; if the user already has skills, skip onboarding.
    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.replace("/auth"); return; }
        fetch(`${API_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const t = data?.user?.teachSkills?.length || 0;
                const l = data?.user?.learnSkills?.length || 0;
                if (t > 0 || l > 0) { router.replace("/feed"); return; } // keeping this direct for existing users
                setReady(true);
            })
            .catch(() => setReady(true));
    }, []);

    const canContinue = teach.length >= 1 && learn.length >= 1;

    
    
    const VAPID_PUBLIC_KEY = "BEOJSVZHbTW5emyIBcvb9zEFaSAPjYniGwSDDOOV_3JX7CxPTlD4B1WKo8WmZT3-PR0TYglb1HSyTNdmxun-ed8";
    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
        return outputArray;
    }

    const handleEnablePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            router.push("/feed");
            return;
        }
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            const token = localStorage.getItem("swapifhy_token");
            if (token) {
                await fetch(`${API_URL}/api/user/push-subscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ subscription })
                });
            }
        } catch (err) {
            console.error("Push subscription failed", err);
        }
        router.push("/feed");
    };

    const handleMagicSwap = async () => {
        if (!magicMatch) return;
        setRequestingSwap(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(`${API_URL}/api/chat/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ receiverId: magicMatch.id, skillsToLearn: selectedSkills })
            });
            // We can just redirect them to their matches/chat so they see it!
            router.push("/matches");
        } catch (err) {
            setShowPushPrompt(true);
        }
    };


    const handleSubmit = async () => {
        if (!canContinue) return;
        setSaving(true);
        setError("");
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/user/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ teach: teach.join(","), learn: learn.join(",") }),
            });
            
            if (res.ok) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
                });
                setCompleted(true);
                
                // Fetch first match while confetti plays
                let foundMatch: any = null;
                fetch(`${API_URL}/api/match/all`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.json())
                    .then(data => {
                        if (data.users && data.users.length > 0) {
                            foundMatch = data.users[0];
                            setMagicMatch(foundMatch);
                        }
                    })
                    .catch(() => {});

                setTimeout(() => {
                    if (foundMatch) {
                        setShowMagicMatch(true);
                    } else {
                        setShowPushPrompt(true);
                    }
                }, 3500);

            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Could not save your skills. Please try again.");
                setSaving(false);
            }
        } catch {
            setError("Connection error. Please try again.");
            setSaving(false);
        }
    };

    if (!ready) return null;

    if (showPushPrompt) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-8 transform rotate-12">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tight mb-4">
                        Never Miss a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Match!</span>
                    </h1>
                    <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">
                        Stay connected with your mentors and swap partners. Get instant alerts when someone accepts your request, shares resources, or sends you a message. 
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleEnablePush}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-white text-indigo-900"
                        >
                            Enable Real-time Alerts
                        </button>
                        <button
                            onClick={() => router.push("/feed")}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Maybe Later
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (showMagicMatch && magicMatch) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-heading font-black text-white tracking-tight mb-2">
                            Perfect Match
                        </h1>
                        <p className="text-white/60 text-sm">We found someone who perfectly aligns with your skills!</p>
                    </div>

                    <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-bl-xl text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                            {Math.round(magicMatch.score)}% Match
                        </div>
                        
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent p-0.5 mb-4 shadow-lg">
                            {magicMatch.avatarUrl ? (
                                <img src={magicMatch.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-surface border-2 border-background flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{magicMatch.name?.charAt(0) || "U"}</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{magicMatch.name}</h2>
                        
                        <div className="flex flex-col gap-3 mt-6 text-left">
                            
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-teal-400 mb-2 block tracking-widest">Select what to learn:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {magicMatch.teaching?.map((s: string) => {
                                        const isSelected = selectedSkills.includes(s);
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedSkills(prev => prev.filter(skill => skill !== s));
                                                    } else {
                                                        setSelectedSkills(prev => [...prev, s]);
                                                    }
                                                }}
                                                className={`text-xs px-2 py-1.5 rounded-md border transition-all flex items-center gap-1 ${isSelected ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-white/5 text-white/90 border-white/10 hover:border-white/30'}`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-rose-400 mb-1 block tracking-widest">They Want To Learn</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {magicMatch.learning?.slice(0, 3).map((s: string) => (
                                        <span key={s} className="text-xs bg-white/5 text-white/90 px-2 py-1 rounded-md border border-white/10">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleMagicSwap}
                            disabled={requestingSwap || selectedSkills.length === 0}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff" }}
                        >
                            {requestingSwap ? "Sending..." : <>Send Swap Request <Zap className="w-4 h-4" /></>}
                        </button>
                        <button
                            onClick={() => setShowPushPrompt(true)}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Skip to Feed
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (completed) {

        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative z-10 space-y-6"
                >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                        <span className="text-4xl" dangerouslySetInnerHTML={{ __html: '&#x1F680;' }} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                        Welcome to the top <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">1% of learners</span>.
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">Your hub is being generated...</p>
                </motion.div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Welcome to Swapifhy</span>
                </div>
                <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">Let's set up your matches</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Tell us what you can teach and what you want to learn — this is how we pair you with the right people to swap skills with.
                </p>

                <div className="space-y-6">
                    <TagField
                        label="Skills you can teach"
                        hint="Things you're good at and happy to help others with."
                        placeholder="e.g. Python, Guitar, Public speaking…"
                        tags={teach}
                        setTags={setTeach}
                    />
                    <TagField
                        label="Skills you want to learn"
                        hint="What you'd love to pick up from someone else."
                        placeholder="e.g. UI design, Spanish, Chess…"
                        tags={learn}
                        setTags={setLearn}
                    />
                </div>

                {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={!canContinue || saving}
                    className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {saving ? "Saving…" : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
                {!canContinue && (
                    <p className="text-center text-xs text-muted-foreground mt-3">Add at least one skill to teach and one to learn.</p>
                )}
            </div>
        </div>
    );
}
