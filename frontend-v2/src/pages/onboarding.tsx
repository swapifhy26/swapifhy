import confetti from 'canvas-confetti';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { X, ArrowRight, Sparkles } from "lucide-react";
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

    // Guard: need a token; if the user already has skills, skip onboarding.
    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.replace("/auth"); return; }
        fetch(`${API_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const t = data?.user?.teachSkills?.length || 0;
                const l = data?.user?.learnSkills?.length || 0;
                if (t > 0 || l > 0) { router.replace("/feed"); return; }
                setReady(true);
            })
            .catch(() => setReady(true));
    }, []);

    const canContinue = teach.length >= 1 && learn.length >= 1;

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
                setTimeout(() => {
                    router.push("/feed");
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

    if (!ready) {
        
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
        <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
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
