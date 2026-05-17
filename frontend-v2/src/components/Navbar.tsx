import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, User, Compass, Zap, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ isDark, setIsDark, toggleChatList }: { isDark: boolean, setIsDark: (val: boolean) => void, toggleChatList: () => void }) {
    const [scrolled, setScrolled] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (token) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
            fetch(`${API_URL}/api/user/profile`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.ok ? res.json() : null)
                .then(data => { 
                    if (data?.user) {
                        setUserName(data.user.name);
                        setAvatarUrl(data.user.avatarUrl);
                    }
                })
                .catch(console.error);
        } else {
            setUserName(null);
        }
    }, [router.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("swapifhy_token");
        setUserName(null);
        setAvatarUrl(null);
        router.push("/");
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? "bg-surface/80 backdrop-blur-2xl border-b border-border py-4 shadow-xl" : "bg-transparent py-8"}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] group">
                    <img src="https://www.swapifhy.com/assets/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" className="h-[22px] w-auto drop-shadow-sm dark:brightness-125 transition-transform duration-500 group-hover:rotate-6" />
                    <span className="hidden lg:block text-lg font-heading font-medium tracking-[-0.02em] text-foreground">Swapifhy</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 lg:gap-11 text-sm font-semibold text-foreground tracking-tight">
                    {userName ? (
                        <>
                             <Link href="/feed" className={`${router.pathname === "/feed" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300`}>Feed</Link>
                            <Link href="/network" className={`${router.pathname === "/network" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300`}>Network</Link>
                            <Link href="/explore" className={`${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300`}>Explore</Link>
                            <Link href="/progress" className={`${router.pathname === "/progress" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300`}>Progress</Link>
                            <Link href="/matches" className={`${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300`}>Matches</Link>
                            <button 
                                onClick={toggleChatList}
                                className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 relative group"
                            >
                                <MessageSquare className="w-4.5 h-4.5" />
                                <span>Messages</span>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(75,100,250,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">About</Link>
                            <Link href="/#story" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Story</Link>
                            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Architectures</Link>
                            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">How it Works</Link>
                            <Link href="/#team" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Core Network</Link>
                        </>
                    )}

                    <button 
                        onClick={() => setIsDark(!isDark)} 
                        className="w-[48px] h-[24px] rounded-full bg-foreground/5 border border-border relative cursor-pointer transition-all duration-500 flex items-center px-1 group shadow-inner hover:border-foreground/20"
                    >
                        <div className={`w-[16px] h-[16px] rounded-full bg-foreground transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md ${isDark ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                    </button>

                    {userName ? (
                        <div ref={dropdownRef} className="flex items-center gap-4 ml-2 pl-6 border-l border-border/50 relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 group focus:outline-none"
                            >
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden border transition-all duration-300 shadow-sm ${isDropdownOpen ? 'border-primary shadow-[0_0_15px_rgba(75,100,250,0.3)] ring-2 ring-primary/20 scale-105' : 'border-border/50 group-hover:border-primary/50 group-hover:scale-105'}`}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground text-xs font-bold">
                                            {userName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-sm tracking-tight font-semibold transition-colors ${isDropdownOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                    {userName.split(' ')[0]}
                                </span>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-14 right-0 w-48 glass-elite rounded-2xl shadow-xl border border-border/50 overflow-hidden py-2 z-50 flex flex-col"
                                    >
                                        <Link 
                                            href="/dashboard" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface/80 hover:text-primary transition-colors flex items-center gap-3 w-full text-left"
                                        >
                                            <User className="w-4 h-4 text-primary" /> Profile Swap
                                        </Link>
                                        <Link 
                                            href="/settings" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface/80 hover:text-primary transition-colors flex items-center gap-3 w-full text-left"
                                        >
                                            <Zap className="w-4 h-4 text-accent" /> Preferences
                                        </Link>
                                        
                                        <hr className="border-t border-border/40 my-1 mx-2" />
                                        
                                        <button 
                                            onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                                            className="px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-3 w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4" /> Terminate Session
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link href="/auth" className="ml-2 px-6 py-2.5 rounded-full bg-foreground text-background font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm tracking-tight shadow-md lg:shadow-xl">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
