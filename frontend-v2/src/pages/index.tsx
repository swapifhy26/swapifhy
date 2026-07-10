import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Sparkles, Quote, Zap, Code, Shield, Users, Globe, ArrowRight, Mail, Star, Heart, CheckCircle, Info, Linkedin, Instagram, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { teamData } from "../config/teamData";

// ── Swapifhy Glow Card ──
const GlowCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [hovered, setHovered] = useState(false);
    const [angle, setAngle] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const DURATION = 2400;

    useEffect(() => {
        if (!hovered) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setAngle(0);
            return;
        }
        startRef.current = null;
        const tick = (now: number) => {
            if (!startRef.current) startRef.current = now;
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / DURATION, 1);
            setAngle(progress * 360);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [hovered]);

    const gradient = `conic-gradient(from ${angle}deg at 50% 50%, #5BC4C0, #6B8FD4, #F07060, #5BC4C0)`;

    return (
        <div
            className={`relative rounded-[3.5rem] ${className ?? ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Glow behind card */}
            <div
                className="absolute inset-0 rounded-[3.5rem] pointer-events-none transition-opacity duration-500"
                style={{
                    background: gradient,
                    opacity: hovered ? 0.18 : 0,
                    filter: "blur(18px)",
                    transform: "scale(1.04)",
                }}
            />
            {/* Spinning border ring */}
            <div
                className="absolute inset-0 rounded-[3.5rem] pointer-events-none transition-opacity duration-300"
                style={{
                    padding: "1.5px",
                    background: hovered ? gradient : "transparent",
                    opacity: hovered ? 1 : 0,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            {/* Content */}
            <div className="relative z-10 h-full rounded-[3.5rem] overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default function Home() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();

    const handleWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
            const res = await fetch(`${API_URL}/api/auth/waitlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok || res.status === 409) {
                setSubmitted(true);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || "Waitlist error.");
            }
        } catch (error) {
            console.error("Network error", error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center bg-background scroll-smooth font-sans bg-grid transition-all duration-1000">
            {/* PRO-GRADE GLOBAL DEPTH */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb-pro orb-blue-pro opacity-20 top-[-20%] left-[-10%]" />
                <div className="mesh-orb-pro orb-pink-pro opacity-10 bottom-[-10%] right-[-10%]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "48px 48px" }} />
            </div>

            {/* HERO SECTION */}
            <section className="w-full max-w-7xl mx-auto px-6 text-center mt-44 lg:mt-60 relative z-20 mb-40">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-border glass-elite text-primary font-tech text-[10px] uppercase tracking-[0.6em] mb-16 shadow-2xl backdrop-blur-3xl"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> Status: Online
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-heading font-black tracking-tight leading-[0.95] mb-10 text-foreground uppercase"
                >
                    Learn <span className="text-secondary text-gradient-elite">alongside</span> peers.<br />
                    Not <span className="text-foreground">beneath</span> them.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base md:text-xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto leading-relaxed tracking-normal"
                >
                    Solitary learning is a thing of the past. Awkward outreach is over.<br />
                    <span className="text-foreground tracking-wide font-bold">Discover. Connect. Swap.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center"
                >
                    <button
                        onClick={() => router.push("/auth")}
                        className="btn-elite text-[13px] tracking-[0.4em] !px-16 !py-8 !rounded-[3rem] group overflow-hidden shadow-2xl"
                    >
                        <span className="relative z-10 transition-transform group-hover:scale-105 inline-block font-tech font-black">REQUEST BETA ACCESS</span>
                        <ArrowRight className="w-6 h-6 ml-6 group-hover:translate-x-3 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 h-[100%] bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="mt-12 text-muted font-tech text-[10px] tracking-[0.6em] uppercase opacity-40 font-bold">Community // Skill Swap Platform</p>
                </motion.div>
            </section>

            {/* MARQUEE */}
            <div className="w-[110vw] mx-[-5vw] overflow-hidden py-10 glass-elite backdrop-blur-3xl border-y border-border relative z-20 shadow-xl mb-40 group">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="flex gap-16 whitespace-nowrap text-3xl md:text-5xl font-tech font-bold text-foreground uppercase tracking-[0.4em] items-center pl-16 opacity-10 group-hover:opacity-100 transition-opacity duration-1000"
                >
                    {[...Array(6)].map((_, i) => (
                        <React.Fragment key={i}>
                            <span className="text-transparent [-webkit-text-stroke:1px_var(--color-foreground)]">SWAPIFHY SWAP</span>
                            <span className="text-secondary text-4xl">✧</span>
                            <span className="text-foreground">NOT A PRODUCT</span>
                            <span className="text-accent text-4xl">✧</span>
                            <span className="text-transparent [-webkit-text-stroke:1px_var(--color-foreground)]">AN EXPERIENCE</span>
                            <span className="text-primary text-4xl">✧</span>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* ABOUT / METRICS SECTION */}
            <section id="about" className="max-w-7xl w-full mx-auto px-6 mb-44 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-border glass-elite text-accent font-tech text-[9px] uppercase tracking-[0.5em] mb-10 shadow-md backdrop-blur-3xl">
                            <Info className="w-3.5 h-3.5" /> About Swapifhy
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-8 uppercase leading-[0.9]">
                            Trading Skills,<br /><span className="text-gradient-elite">Reimagined.</span>
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed tracking-normal max-w-xl mb-8">
                            Swapifhy is a peer-to-peer skill exchange platform — like trading exam papers to check each other's grades, but for real-world skills. We are building the infrastructure for the next generation of collaborative learning.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-sans text-muted-foreground">Currently in <span className="text-foreground font-semibold">Beta</span> — accepting early access requests</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="p-7 md:p-8 rounded-3xl glass-elite flex flex-col justify-between shadow-xl group hover:border-primary/40 transition-all duration-500 cursor-default">
                            <span className="text-[10px] font-tech text-muted-foreground uppercase tracking-[0.4em] mb-3">Total Reach</span>
                            <span className="text-3xl md:text-4xl font-heading font-black text-foreground group-hover:text-primary transition-colors">200k+</span>
                            <span className="text-[10px] font-sans text-muted-foreground mt-2">Network Impressions</span>
                        </div>
                        <div className="p-7 md:p-8 rounded-3xl glass-elite flex flex-col justify-between shadow-xl group hover:border-secondary/40 transition-all duration-500 cursor-default">
                            <span className="text-[10px] font-tech text-muted-foreground uppercase tracking-[0.4em] mb-3">Early Access</span>
                            <span className="text-3xl md:text-4xl font-heading font-black text-primary group-hover:scale-105 transition-transform origin-left">350+</span>
                            <span className="text-[10px] font-sans text-muted-foreground mt-2">Users on Waitlist</span>
                        </div>
                        <div className="col-span-2 px-6 py-5 rounded-3xl border border-border bg-foreground/[0.02] flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                            <div>
                                <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider mb-0.5">Platform Status</p>
                                <p className="text-sm font-sans font-semibold text-foreground">Beta — Open for Early Access · Accepting new signups</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STORY */}
            <section id="story" className="max-w-7xl w-full mx-auto px-6 mb-56 relative z-20 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-border glass-elite text-secondary font-tech text-[10px] uppercase tracking-[0.4em] mb-12 shadow-md backdrop-blur-3xl">
                    <Heart className="w-3.5 h-3.5 fill-secondary/20" /> The Master Plan
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-foreground mb-12 uppercase leading-[0.9] italic">
                    Connected <br /><span className="text-gradient-elite font-tech tracking-wider">Skill Swaps.</span>
                </h2>
                <div className="max-w-4xl mx-auto my-16 space-y-12 text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed tracking-normal">
                    <p className="text-muted-foreground opacity-50 font-tech text-[10px] uppercase tracking-[0.5em] mb-8">// FOUNDER'S VISION: ANWESHA GANJI</p>
                    <p>
                        "Swapifhy was conceived not merely as a platform, but as a bridge for the
                        <span className="inline text-foreground font-black border-b-[3px] border-primary/20 hover:border-primary transition-all duration-500 pb-0.5 cursor-help mx-2">
                            Global Learning Network.
                        </span>"
                    </p>
                    <p className="opacity-70 max-w-2xl mx-auto leading-loose text-lg italic">
                        Our mission is to make learning accessible to everyone—allowing every person to share their skills with the community.
                    </p>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="max-w-7xl w-full mx-auto px-6 mb-48 relative z-20">
                <div className="mb-14 text-center">
                    <span className="text-accent font-tech font-black uppercase tracking-[0.6em] text-[10px] mb-5 block">✧ Platform Capabilities ✧</span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground uppercase leading-[0.95]">
                        Built for <span className="text-gradient-elite">Real Exchange.</span>
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground font-sans max-w-lg mx-auto leading-relaxed">
                        Every feature is designed around one idea — skills flow best between people who actually want to trade them.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[1fr_1fr_auto] gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        whileHover={{ y: -3 }}
                        className="md:col-span-2 md:row-span-2 group relative rounded-3xl glass-elite p-10 flex flex-col justify-between cursor-default border border-border hover:border-primary/30 transition-all duration-500 overflow-hidden min-h-[320px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
                                <Zap className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-heading font-black text-foreground mb-4 uppercase tracking-tight">Instant Skill Matching</h3>
                            <p className="text-muted-foreground font-sans text-base leading-relaxed max-w-lg">
                                Our tool finds people whose skills match yours — not just in the same area, but across different fields. A developer meets a designer. A writer finds a strategist.
                            </p>
                        </div>
                        <div className="mt-10 flex items-center gap-2 text-primary font-sans font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                            <span>The core engine</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        whileHover={{ y: -3 }}
                        className="group relative rounded-3xl glass-elite p-7 flex flex-col cursor-default border border-border hover:border-secondary/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-secondary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="w-11 h-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
                            <Users className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="text-lg font-heading font-black text-foreground mb-2 uppercase tracking-tight">Peer Network</h3>
                        <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1">
                            Build a circle of people you actually learn from. No followers, no feeds — just real skill relationships.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                        whileHover={{ y: -3 }}
                        className="group relative rounded-3xl glass-elite p-7 flex flex-col cursor-default border border-border hover:border-accent/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                            <Shield className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-lg font-heading font-black text-foreground mb-2 uppercase tracking-tight">Structured Exchange</h3>
                        <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1">
                            Every swap is defined upfront — what you give, what you get. No ambiguity, no awkward negotiations.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        whileHover={{ y: -3 }}
                        className="group relative rounded-3xl glass-elite p-7 flex flex-col cursor-default border border-border hover:border-primary/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                            <Code className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-heading font-black text-foreground mb-2 uppercase tracking-tight">Skill Profiles</h3>
                        <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1">
                            Showcase what you know and what you want to learn. Your profile is your trading card in the network.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
                        whileHover={{ y: -3 }}
                        className="md:col-span-2 group relative rounded-3xl glass-elite p-7 flex flex-row items-center gap-7 cursor-default border border-border hover:border-secondary/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <Globe className="w-7 h-7 text-secondary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-black text-foreground mb-1.5 uppercase tracking-tight">Open to All Disciplines</h3>
                            <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                                Design, engineering, writing, music, finance, marketing — if it&apos;s a skill, it can be traded. We&apos;re building the exchange layer for human knowledge.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="max-w-6xl w-full mx-auto px-6 mb-44 relative z-20">
                <div className="text-center mb-28">
                    <span className="text-secondary font-tech font-black uppercase tracking-[0.6em] text-[10px] mb-8 block">✧ Simple Steps ✧</span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground uppercase leading-[0.95]">How it <span className="text-gradient-elite">Works</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-20 relative">
                    <div className="hidden md:block absolute top-[28%] left-0 w-full h-[1px] bg-border z-0" />
                    {[
                        { step: "0x01", title: "CREATE PROFILE", desc: "List your skills and what you want to learn from others." },
                        { step: "0x02", title: "FIND MATCHES", desc: "Our system identifies people who match your skill needs." },
                        { step: "0x03", title: "START SWAPPING", desc: "Message your matches and start learning something new." }
                    ].map((s, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-3xl glass-elite flex items-center justify-center font-tech font-black text-foreground text-lg mb-10 group-hover:scale-110 transition-all duration-500 shadow-xl relative overflow-hidden border border-border group-hover:border-primary/40">
                                <span className="relative z-10">{s.step}</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <h3 className="text-2xl font-heading font-black text-foreground mb-4 uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{s.title}</h3>
                            <p className="text-muted-foreground font-sans text-[15px] leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TEAM SECTION with GlowCard ── */}
            <section id="team" className="w-full max-w-7xl mx-auto px-6 py-40 relative z-20 border-t border-border/40">
                <div className="mb-28 text-center flex flex-col items-center">
                    <span className="text-primary font-tech font-black uppercase tracking-[0.8em] text-[10px] mb-8 block">✧ The Architect Collective ✧</span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground uppercase leading-none">
                        Core <span className="text-gradient-elite">Architects</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamData.sort((a, b) => (a.level ?? 3) - (b.level ?? 3)).map((member, i) => {
                        const isFounder = (member.level ?? 3) === 0;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className={`h-full ${isFounder ? "lg:col-span-2" : ""}`}
                            >
                                {/* ✅ GlowCard wraps each team card */}
                                <GlowCard className="h-full">
                                    <div className={`group p-8 rounded-[3.5rem] glass-elite transition-all duration-500 flex flex-col relative overflow-hidden h-full ${isFounder ? "lg:p-10" : ""}`}>

                                        {/* SOCIALS */}
                                        <div className="absolute top-5 right-5 flex items-center gap-2 z-30">
                                            {member.linkedin && (
                                                <a href={member.linkedin} target="_blank" className="w-8 h-8 rounded-xl bg-foreground/8 hover:bg-primary/15 flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-all duration-200 shadow-sm">
                                                    <Linkedin className="w-3.5 h-3.5 stroke-[2px]" />
                                                </a>
                                            )}
                                            {member.xSocial && (
                                                <a href={member.xSocial} target="_blank" className="w-8 h-8 rounded-xl bg-foreground/8 hover:bg-secondary/15 flex items-center justify-center border border-border text-muted-foreground hover:text-secondary transition-all duration-200 shadow-sm">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.489h2.039L6.486 3.24H4.298l13.311 17.403z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>

                                        {/* AVATAR + NAME */}
                                        <div className={`flex flex-col mb-8 ${isFounder ? "md:flex-row md:items-center md:gap-10" : "items-center text-center"}`}>
                                            {member.image ? (
                                                <div className={`${isFounder ? "w-32 h-32" : "w-24 h-24"} rounded-[2.5rem] overflow-hidden shrink-0 border border-border shadow-xl bg-surface mb-6 md:mb-0 p-1`}>
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-all rounded-[2.2rem]" />
                                                </div>
                                            ) : (
                                                <div className={`${isFounder ? "w-32 h-32" : "w-24 h-24"} rounded-[2.5rem] flex items-center justify-center text-2xl font-heading font-black shrink-0 border border-border shadow-xl uppercase mb-6 md:mb-0`} style={{ background: member.color, color: member.text }}>
                                                    {member.avatar}
                                                </div>
                                            )}
                                            <div className={`${isFounder ? "text-left" : "space-y-2"}`}>
                                                <h3 className={`${isFounder ? "text-3xl" : "text-xl"} font-heading font-black tracking-tight text-foreground uppercase leading-none`}>{member.name}</h3>
                                                <p className="text-[9px] font-tech font-bold text-primary uppercase tracking-[0.4em] mt-2">{member.role}</p>
                                            </div>
                                        </div>

                                        {/* DESCRIPTION */}
                                        <p className={`text-muted-foreground font-sans leading-relaxed flex-1 ${isFounder ? "text-[15px] text-left md:max-w-lg" : "text-sm text-center"}`}>
                                            {member.description}
                                        </p>

                                        {/* FOOTER */}
                                        <div className={`mt-6 pt-5 border-t border-border flex items-center gap-2.5 ${isFounder ? "justify-start" : "justify-center"}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_var(--color-primary)]" />
                                            <span className="text-[10px] font-tech font-bold text-muted-foreground uppercase tracking-[0.3em]">Core Network</span>
                                        </div>
                                    </div>
                                </GlowCard>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full bg-background relative z-10 pt-32 pb-12 border-t border-border overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 mb-24">

                        {/* Brand + Inquiry Form */}
                        <div className="md:col-span-5 flex flex-col">
                            <Link href="/" className="flex items-center gap-4 mb-8 group w-fit cursor-pointer">
                                <div className="w-11 h-11 rounded-xl bg-foreground/5 border border-border flex items-center justify-center p-2 group-hover:border-primary/40 transition-all">
                                    {/* ✅ Fixed logo path */}
                                    <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-heading font-black tracking-tight text-foreground uppercase leading-none">Swapifhy</span>
                                    <span className="text-[10px] font-sans text-muted-foreground mt-0.5">Peer-to-Peer Skill Exchange</span>
                                </div>
                            </Link>

                            <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-8 max-w-xs">
                                We&apos;re building the next generation of collaborative learning — where skills flow freely between people.
                            </p>

                            <div className="border border-border rounded-2xl p-5 bg-foreground/[0.02]">
                                <h5 className="text-foreground font-sans font-semibold text-sm mb-1">Get in Touch</h5>
                                <p className="text-xs text-muted-foreground font-sans mb-4">For press, partnerships, or general inquiries.</p>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const emailVal = (form.querySelector("#footer-email") as HTMLInputElement)?.value;
                                        if (emailVal) {
                                            window.location.href = `mailto:hello@swapifhy.com?subject=Inquiry from ${emailVal}`;
                                        }
                                    }}
                                    className="flex flex-col gap-2.5"
                                >
                                    <input
                                        id="footer-email"
                                        type="email" required placeholder="Your email address"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <input
                                        type="text" placeholder="Subject (optional)"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <button type="submit" className="w-full py-2.5 rounded-xl bg-foreground text-background font-sans font-semibold text-sm hover:bg-primary hover:text-white transition-all">
                                        Send Inquiry
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Navigation Grids */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16 pt-4">
                            <div className="flex flex-col gap-5">
                                <h4 className="font-sans font-semibold text-foreground text-xs uppercase tracking-[0.2em] mb-2 opacity-50">Product</h4>
                                <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">About</Link>
                                <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">Features</Link>
                                <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">How it Works</Link>
                                <Link href="/auth" className="text-sm text-primary hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans mt-1">Sign In</Link>
                            </div>
                            <div className="flex flex-col gap-5">
                                <h4 className="font-sans font-semibold text-foreground text-xs uppercase tracking-[0.2em] mb-2 opacity-50">Company</h4>
                                <Link href="/#story" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">Our Story</Link>
                                <Link href="/#team" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">Team</Link>
                                <a href="https://tally.so/r/Ek5KZr" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans flex items-center gap-1.5">Careers <ExternalLink className="w-3 h-3" /></a>
                                <a href="#" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 font-sans">Press Kit</a>
                            </div>
                            <div className="flex flex-col gap-5 col-span-2 sm:col-span-1 mt-6 sm:mt-0">
                                <h4 className="font-sans font-semibold text-foreground text-xs uppercase tracking-[0.2em] mb-2 opacity-50">Connect</h4>
                                <div className="flex flex-col gap-4">
                                    <a
                                        href="https://www.instagram.com/swapifhy/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center border border-border group-hover:bg-foreground/10 transition-all">
                                            <Instagram className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-sans">Instagram</span>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/company/swapifhy/posts/?feedView=all"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center border border-border group-hover:bg-foreground/10 transition-all">
                                            <Linkedin className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-sans">LinkedIn</span>
                                    </a>
                                    <a
                                        href="https://mail.google.com/mail/?view=cm&fs=1&to=swapifhy.official@gmail.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center border border-border group-hover:bg-foreground/10 transition-all">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-sans">Contact Us</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom Bar */}
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground font-sans">
                            &copy; {new Date().getFullYear()} Swapifhy, Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground font-sans">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
