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
                localStorage.setItem("swapifhy_user",  JSON.stringify(data.user));
                router.push("/feed");
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
                            src="https://www.swapifhy.com/assets/swapifhy-logo-DPxPDdg-.png"
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>

                        {/* Access state note */}
                        <div className="text-center text-sm text-muted-foreground">
                            {allowRegistrations
                                ? "Swapifhy is in limited access. Accounts are invite-only for now."
                                : "Public onboarding is currently closed."}
                        </div>
                    </form>

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
