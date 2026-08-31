import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Bug, MessageSquare, Plus, Minus, CheckCircle, Ticket, ChevronRight, Zap } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";

const FAQS = [
    { q: "What is Swapifhy?", a: "Swapifhy is a skill-exchange platform where you can teach what you know and learn what you don't." },
    { q: "How does the 'Magic First Match' work?", a: "Our algorithm automatically finds the most highly compatible user for you immediately after onboarding based on your skills." },
    { q: "Is Swapifhy free?", a: "Yes, standard skill swapping is completely free and community-driven." },
    { q: "How do I start a swap?", a: "Go to the Explore page, find a user, and click the 'Start Swap' button to select which skills you want to learn." },
    { q: "What happens after I send a request?", a: "The user receives a notification. If they accept, an active Mentorship chat is created." },
    { q: "How are streaks calculated?", a: "Streaks are calculated using your local timezone. Log in and hit 'Mark Today's Streak' daily to grow your flame." },
    { q: "Can I learn multiple skills at once?", a: "Absolutely! There are no limits on how many skills you can select during a swap request." },
    { q: "What is XP used for?", a: "XP determines your global reputation score, which ranks you higher on the recommendation lists." },
    { q: "How do I earn XP?", a: "You earn XP by maintaining streaks, accepting swaps, and staying active on the feed." },
    { q: "Why was my swap rejected?", a: "Users may reject swaps if they are too busy or don't feel it's a mutual fit. Don't worry, keep exploring!" },
    { q: "Can I delete my account?", a: "Yes, you can terminate your session or delete your account from the Preferences menu." },
    { q: "Is there a mobile app?", a: "Swapifhy is optimized as a Progressive Web App (PWA) and works beautifully on all mobile browsers." },
    { q: "What is the Feed for?", a: "The feed allows you to share updates, ask questions, and broadcast your learning milestones to the community." },
    { q: "Can I block a user?", a: "Yes, you can sever connections and block users from their profile page if they violate community guidelines." },
    { q: "How do I update my bio?", a: "Go to the Profile section from the top-right dropdown and edit your details." },
    { q: "Are chats encrypted?", a: "Chats are secured and stored safely, though standard community safety guidelines apply." },
    { q: "What if someone doesn't respond?", a: "Swap requests stay pending until accepted or revoked. You can revoke them from your Progress hub." },
    { q: "How do I change my theme?", a: "Swapifhy automatically adapts to your system preferences, but we also offer manual toggles in Settings." },
    { q: "Who are the 'Top Recommendations'?", a: "These are the highest-rated swappers in specific domains like AI, CS, and Design." },
    { q: "How can I report a bug?", a: "Use the 'Report a Bug' tab right here on the Help page!" }
];

export default function HelpPage() {
    const [activeTab, setActiveTab] = useState<"FAQ" | "QUERY" | "BUG">("FAQ");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    
    // Form states
    const [category, setCategory] = useState("General Support");
    const [content, setContent] = useState("");
    const [submitted, setSubmitted] = useState(false);
    
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("swapifhy_tickets");
        if (saved) setTickets(JSON.parse(saved));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const ticket = {
            id: "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            type: activeTab,
            category: activeTab === "BUG" ? "Bug Report" : category,
            content,
            date: new Date().toLocaleString(),
            status: "OPEN"
        };

        const updated = [ticket, ...tickets];
        setTickets(updated);
        localStorage.setItem("swapifhy_tickets", JSON.stringify(updated));

        try {
            const token = localStorage.getItem("swapifhy_token");
            if (token) {
                // Ignore API_URL import issues, we can just fetch relative to window.location or use absolute
                // Wait, help.tsx might not have API_URL imported. Let's just use the absolute or standard prefix.
                // It's usually imported from lib/api. We'll require it or just use fetch(`https://swapifhy-backend-iu0x.onrender.com/api/user/ticket`)
                await fetch(`https://swapifhy-backend-iu0x.onrender.com/api/user/ticket`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ticketId: ticket.id,
                        type: ticket.type,
                        category: ticket.category,
                        content: ticket.content
                    })
                });
            }
        } catch(err) {
            console.error("Failed to sync ticket to server", err);
        }
        
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setContent("");
            setActiveTab("FAQ");
        }, 4000);
    };

    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-36 md:pb-24">
            <Head><title>Help & Support - Swapifhy</title></Head>

            {/* Glowing Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4 flex items-center justify-center gap-3">
                        <HelpCircle className="w-10 h-10 text-emerald-400" />
                        Help & Support
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">We're here to help you get the most out of your skill-swapping journey.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    <button onClick={() => setActiveTab("FAQ")} className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "FAQ" ? "bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105" : "bg-surface border border-border text-muted-foreground hover:bg-surface/80"}`}>
                        Frequently Asked Questions
                    </button>
                    <button onClick={() => setActiveTab("QUERY")} className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "QUERY" ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" : "bg-surface border border-border text-muted-foreground hover:bg-surface/80"}`}>
                        Raise a Query
                    </button>
                    <button onClick={() => setActiveTab("BUG")} className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "BUG" ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-105" : "bg-surface border border-border text-muted-foreground hover:bg-surface/80"}`}>
                        Report a Bug / Feedback
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-10 rounded-[2rem] glass-card border border-emerald-500/30 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Thank you!</h2>
                                    <p className="text-muted-foreground mb-6">Your submission has been recorded. A ticket ID has been generated in your history.</p>
                                    {activeTab === "BUG" && <p className="text-sm text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl">Rest assured, this bug will be resolved with further updates.</p>}
                                </motion.div>
                            ) : activeTab === "FAQ" ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    {FAQS.map((faq, i) => (
                                        <div key={i} className="rounded-2xl bg-surface/50 border border-border/50 overflow-hidden transition-all hover:border-emerald-500/30">
                                            <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between font-bold text-left">
                                                {faq.q}
                                                {openFaqIndex === i ? <Minus className="w-4 h-4 text-emerald-400 shrink-0" /> : <Plus className="w-4 h-4 text-muted-foreground shrink-0" />}
                                            </button>
                                            <AnimatePresence>
                                                {openFaqIndex === i && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-4 text-muted-foreground text-sm">
                                                        {faq.a}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 rounded-[2rem] glass-card border border-border/50 shadow-2xl relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${activeTab === 'BUG' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                    
                                    <h2 className="text-2xl font-black mb-2">{activeTab === "BUG" ? "Report an Issue" : "Raise a Query"}</h2>
                                    <p className="text-muted-foreground text-sm mb-8">
                                        {activeTab === "BUG" ? "Found something broken? Let us know and we will squash it in the next update!" : "Need help from a specific department? Drop your query on the letter pad below."}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {activeTab === "QUERY" && (
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Department</label>
                                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 rounded-xl bg-background border border-border focus:border-blue-500 outline-none appearance-none font-medium text-foreground">
                                                    <option className="bg-background text-foreground">General Support</option>
                                                    <option className="bg-background text-foreground">Account & Billing</option>
                                                    <option className="bg-background text-foreground">Technical Assistance</option>
                                                    <option className="bg-background text-foreground">Safety & Moderation</option>
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Writing Space</label>
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJsaW5lcyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyOCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMjhMMTAwIDI4IiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNsaW5lcykiLz48L3N2Zz4=')] opacity-20 pointer-events-none rounded-xl" />
                                                <textarea 
                                                    value={content} 
                                                    onChange={e => setContent(e.target.value)}
                                                    required 
                                                    placeholder="Start writing here..."
                                                    className="w-full h-64 p-4 rounded-xl bg-background/50 border border-border focus:border-emerald-500 outline-none resize-none leading-[28px] font-medium"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-xl hover:scale-[1.02] ${activeTab === 'BUG' ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' : 'bg-blue-500 shadow-blue-500/20 hover:bg-blue-600'}`}>
                                            Submit Ticket
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ticket History Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 rounded-[2rem] bg-surface/30 border border-border/50 sticky top-32">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-6">
                                <Ticket className="w-4 h-4 text-emerald-400" /> Query Raised
                            </h3>

                            {tickets.length > 0 ? (
                                <div className="space-y-4">
                                    {tickets.map((t, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-background border border-border/50 relative overflow-hidden group">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${t.type === 'BUG' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-black font-mono text-muted-foreground">{t.id}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">{t.status}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-foreground mb-1">{t.category}</h4>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{t.content}</p>
                                            <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{t.date}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <Ticket className="w-8 h-8 mx-auto mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No tickets yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
