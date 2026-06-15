import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

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
                <title>Admin Login — Swapifhy</title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <Shield className="w-7 h-7 text-indigo-600" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Login</h1>
                            <p className="text-sm text-gray-400">Swapifhy · Restricted access</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Admin Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="admin-key-input"
                                        type={showSecret ? "text" : "password"}
                                        value={secret}
                                        onChange={(e) => { setSecret(e.target.value); setError(""); }}
                                        placeholder="Enter your admin key"
                                        autoComplete="off"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                id="admin-login-btn"
                                type="submit"
                                disabled={loading || !secret}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Access Dashboard</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-300 mt-8">Swapifhy · Internal use only</p>
                    </div>
                </div>
            </div>
        </>
    );
}
