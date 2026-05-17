import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const router = useRouter();
    const [secret, setSecret] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // If already authenticated, skip login
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("swapifhy_admin_key");
            if (stored) router.replace("/admin");
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!secret.trim()) return;
        setLoading(true);
        setError("");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

            const res = await fetch(`${API_URL}/api/admin/overview`, {
                headers: { "x-admin-key": secret },
            });

            if (res.ok) {
                sessionStorage.setItem("swapifhy_admin_key", secret);
                router.replace("/admin");
            } else {
                setError("Invalid admin key. Access denied.");
                setLoading(false);
            }
        } catch {
            setError("Could not reach the server. Is the backend running?");
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Admin Login — Swapifhy Command Center</title>
                <meta name="robots" content="noindex" />
            </Head>

            {/* Full dark background */}
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center relative overflow-hidden font-sans">
                {/* Ambient orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[160px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/8 blur-[140px]" />
                    {/* Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-md mx-auto px-6"
                >
                    {/* Card */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-10 backdrop-blur-xl shadow-2xl">
                        {/* Shield icon */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                                <Shield className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-2xl font-black tracking-tight text-white uppercase mb-2">
                                Command Center
                            </h1>
                            <p className="text-sm text-white/40 font-medium">
                                Swapifhy Admin Portal · Restricted Access
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">
                                    Admin Key
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        id="admin-key-input"
                                        type={showSecret ? "text" : "password"}
                                        value={secret}
                                        onChange={(e) => { setSecret(e.target.value); setError(""); }}
                                        placeholder="Enter your admin key"
                                        autoComplete="off"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                    <p className="text-xs text-red-400 font-medium">{error}</p>
                                </motion.div>
                            )}

                            <button
                                id="admin-login-btn"
                                type="submit"
                                disabled={loading || !secret}
                                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 group"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Access Dashboard</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-[10px] text-white/20 mt-8 font-medium tracking-wider uppercase">
                            Swapifhy Inc. · Internal Use Only
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
