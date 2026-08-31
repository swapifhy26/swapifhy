// pages/auth.tsx
// FIX: added missing useState + useEffect imports
// FIX: status response uses allowNewRegistrations (not allowRegistrations)

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Eye, EyeOff, ArrowLeft,
    CheckCircle, AlertTriangle, ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../lib/api";

export default function Auth() {
    const [email,        setEmail]        = useState("");
    const [password,     setPassword]     = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState("");
    const [loading,      setLoading]      = useState(false);
    const [rememberMe,   setRememberMe]   = useState(false);

    // Platform control states driven by admin SystemSettings
    const [isMaintenance,       setIsMaintenance]       = useState(false);
    const [allowRegistrations,  setAllowRegistrations]  = useState(true);

    const router = useRouter();

    // Fetch platform state on mount — drives maintenance lockscreen and
    // registration-closed banner before the user even tries to log in.
    useEffect(() => {
        const checkPlatformStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/status`);
                if (res.ok) {
                    const status = await res.json();
                    setIsMaintenance(status.maintenanceMode);
                    // FIX: backend now sends allowNewRegistrations (not allowRegistrations)
                    setAllowRegistrations(status.allowNewRegistrations ?? true);
                }
            } catch (err) {
                console.error("Could not fetch platform status:", err);
                // Safe defaults — don't show maintenance on network error
            }
        };
        checkPlatformStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("swapifhy_token", data.token);
                localStorage.setItem("swapifhy_user", JSON.stringify(data.user));
                // Send users with no skills through onboarding so matching has data to work with.
                try {
                    const profRes = await fetch(`${API_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${data.token}` } });
                    const prof = await profRes.json();
                    const hasSkills = (prof?.user?.teachSkills?.length || 0) > 0 || (prof?.user?.learnSkills?.length || 0) > 0;
                    router.push(hasSkills ? "/feed" : "/onboarding");
                } catch {
                    router.push("/feed");
                }
            } else {
                setError(data.message || data.error || "Something went wrong.");
                // Backend sends 503 when maintenance mode is enabled —
                // flip the UI into the lockscreen retroactively.
                if (res.status === 503) setIsMaintenance(true);
            }
        } catch {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── RENDER A: MAINTENANCE LOCKSCREEN ──
    if (isMaintenance) {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-surface border border-border rounded-xl p-8 text-center shadow-xl space-y-6"
                >
                    <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 animate-pulse">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-heading font-semibold text-foreground">
                            Under Maintenance
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Swapifhy is temporarily down for planned maintenance or system upgrades.
                            We are swapping engines to provide a smoother workspace!
                        </p>
                    </div>
                    <div className="bg-background/50 border border-border/60 rounded-lg p-3 text-xs text-muted-foreground">
                        Please check back shortly.
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── RENDER B: NORMAL LOGIN WITH OPTIONAL REGISTRATION BANNER ──
    return (
        <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row font-sans">

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex w-[42%] relative bg-surface flex-col justify-between p-12 border-r border-border overflow-hidden">

                {/* Ambient glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 blur-[80px] rounded-full opacity-30" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/20 blur-[60px] rounded-full opacity-30" />

                {/* Logo */}
                <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-lg border border-border bg-white flex items-center justify-center p-1.5">
                        <img
                            src="/images/features/swapifhy-logo-DPxPDdg-.png"
                            alt="Swapifhy Logo"
                        />
                    </div>
                    <span className="text-lg font-heading font-medium text-foreground">
                        Swapifhy
                    </span>
                </div>

                {/* Headline */}
                <div className="z-10 flex-1 flex flex-col justify-center">
                    <span className="text-xs text-primary uppercase tracking-wider mb-4">
                        Learn. Swap. Grow.
                    </span>

                    <h1 className="text-4xl font-heading font-semibold text-foreground leading-tight mb-4">
                        Learn from people.
                        <br />
                        Not just videos.
                    </h1>

                    <p className="text-muted-foreground text-sm max-w-sm">
                        Find people to learn from. Swap skills. Grow together.
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            "People are already joining",
                            "New users every day",
                            allowRegistrations
                                ? "Limited beta access"
                                : "Registrations locked"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground opacity-60">
                    Your data stays private.
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-full lg:w-[58%] flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[380px]"
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-heading font-semibold text-foreground">
                            Welcome back
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Sign in to continue
                        </p>
                    </div>

                    {/* Registration-closed banner */}
                    {!allowRegistrations && (
                        <div className="mb-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-500 text-xs">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold block">Registrations Blocked</span>
                                Creation of new accounts is suspended temporarily by web admins.
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full bg-surface text-foreground border border-border rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/40"
                        />

                        {/* Password */}
                        <div className="relative">
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                className="w-full bg-surface text-foreground border border-border rounded-lg py-3 px-4 pr-10 text-sm focus:outline-none focus:border-primary/40"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(v => !v)}
                                className="accent-primary"
                            />
                            Remember me
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="text-red-500 text-sm bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-3 py-2 rounded-lg text-center border border-red-200 dark:border-red-900/50">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? "Signing in…" : "Sign in"}
                            </button>
                            
                            <a
                                href="https://forms.gle/QGkAaG99uTxUre7T7"
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center py-3 rounded-lg bg-surface border border-border text-foreground text-sm font-medium hover:bg-white/5 transition"
                            >
                                Request Beta Access
                            </a>
                        </div>

                        {/* Access state note */}
                        <div className="text-center text-sm text-muted-foreground">
                            {allowRegistrations
                                ? "Swapifhy is in limited access. Accounts are invite-only for now."
                                : "Public onboarding is currently closed."}
                        </div>
                    </form>

                    {/* Support & Help Banner */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-pink-400"></div>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 mb-1.5 uppercase tracking-wide">
                                    Having trouble signing in?
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                    If you face any issues like <strong className="text-foreground font-medium bg-foreground/5 px-1 py-0.5 rounded">invalid credentials</strong>, you can raise an issue on our <Link href="/help" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 transition-colors">Help Page</Link>.
                                </p>
                                <div className="bg-surface/60 rounded-lg p-3 border border-border/60 shadow-inner">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Or contact the concerned officers:</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                                        <span className="text-xs font-bold text-foreground">Anwesha Ganji & Ishani Sharma</span>
                                    </div>
                                    <a href="mailto:swapifhy.official@gmail.com" className="text-xs font-semibold text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 flex items-center gap-2 transition-colors group bg-pink-500/10 w-fit px-3 py-1.5 rounded-full border border-pink-500/20">
                                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        swapifhy.official@gmail.com
                                    </a>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 italic">
                                    We are committed to serving you and solving your problems — that's what Swapifhy does! 💙
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-8 text-sm text-muted-foreground">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft size={14} /> Back
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
