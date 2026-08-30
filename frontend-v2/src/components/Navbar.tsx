import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, User, Users, Compass, Zap, MessageSquare, Bell } from "lucide-react"; // Added Bell icon
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../lib/api";



export default function Navbar({ isDark, setIsDark, toggleChatList }: { isDark: boolean, setIsDark: (val: boolean) => void, toggleChatList: () => void }) {
    const [scrolled, setScrolled] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userXp, setUserXp] = useState<number>(0);
    
    // Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch Notifications
    useEffect(() => {
        if (userName) {
            const fetchNotifs = () => {
                const token = localStorage.getItem("swapifhy_token");
                if (!token) return;
                fetch(`${API_URL}/api/notifications`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(r => r.json())
                .then(d => {
                    if (d.notifications) setNotifications(d.notifications);
                    if (d.unreadCount !== undefined) setUnreadCount(d.unreadCount);
                })
                .catch(() => {});
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 15000); // 15s poll
            return () => clearInterval(interval);
        }
    }, [userName]);

    const markAllRead = () => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) return;
        fetch(`${API_URL}/api/notifications/read-all`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        }).then(() => {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });
    };

    const handleNotificationClick = (n: any) => {
        if (!n.isRead) {
            const token = localStorage.getItem("swapifhy_token");
            fetch(`${API_URL}/api/notifications/${n.id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            }).then(() => {
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            });
        }
        setIsNotificationOpen(false);
        if (n.link) {
            window.location.href = n.link;
        }
    };
    
    // Refs for outside click detection
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    
    const router = useRouter();

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
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
                        setUserXp(data.user.xp || 0);
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
        <>
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? "bg-surface/80 backdrop-blur-2xl border-b border-border py-4 shadow-xl" : "bg-transparent py-8"}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] group">
                    <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" className="h-[22px] w-auto drop-shadow-sm dark:brightness-125 transition-transform duration-500 group-hover:rotate-6" />
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

                    
                </div> {/* End of desktop links */}

                <div className="flex items-center gap-4 md:gap-6"> {/* Start of right side controls */}
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={() => setIsDark(!isDark)} 
                        className="w-[48px] h-[24px] rounded-full bg-foreground/5 border border-border relative cursor-pointer transition-all duration-500 flex items-center px-1 group shadow-inner hover:border-foreground/20"
                    >
                        <div className={`w-[16px] h-[16px] rounded-full bg-foreground transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md ${isDark ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                    </button>

                    {userName ? (
                        <>
                        
                        <div className="flex items-center gap-2 md:gap-0 pl-2 md:pl-6 ml-2 md:border-l border-border/50 relative">
                            
                            {/* ── NOTIFICATION BELL INTEGRATION ── */}
                            <div ref={notificationRef} className="relative mr-5">
                                <button
                                    onClick={() => {
                                        setIsNotificationOpen(!isNotificationOpen);
                                        setIsDropdownOpen(false); // Close profile if open
                                    }}
                                    className="relative p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-foreground/5"
                                >
                                    <Bell className="w-[18px] h-[18px]" />
                                    {/* Active Pulse Indicator */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(75,100,250,0.8)]" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute top-12 -right-12 md:right-[-80px] w-[90vw] max-w-[320px] sm:w-80 glass-elite bg-surface/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 py-3 z-50 flex flex-col"
                                        >
                                            <div className="px-4 pb-3 border-b border-border/50 flex justify-between items-center mb-2">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notifications</h3>
                                                <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline transition-all">Mark read</button>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto px-2 space-y-1">
                                                {notifications.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground">No notifications yet.</div>
    ) : (
        notifications.map((n) => (
            <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 rounded-xl transition-colors cursor-pointer ${n.isRead ? 'opacity-60 hover:bg-foreground/5' : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'}`}>
                <p className="text-xs font-medium text-foreground leading-snug">{n.message}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 uppercase tracking-widest font-bold opacity-70">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
            </div>
        ))
    )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── PROFILE DROPDOWN ── */}
                            <div ref={dropdownRef} className="relative">
                                <button 
                                    onClick={() => {
                                        setIsDropdownOpen(!isDropdownOpen);
                                        setIsNotificationOpen(false); // Close notifications if open
                                    }}
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
                                    <span className={`hidden md:inline text-sm tracking-tight font-semibold transition-colors ${isDropdownOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
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
                        href="/matches"
                        className={`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 ${router.pathname === "/matches" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}`}
                    >
                        <Users className={`w-[22px] h-[22px] transition-colors ${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-bold mt-1 transition-colors ${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}`}>Matches</span>
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
                        </div>
                        </>
                    ) : (
                        <Link href="/auth" className="ml-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm tracking-tight shadow-md lg:shadow-xl">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>

        
        {/* MOBILE BOTTOM NAVIGATION (GLASSMORPHIC PILL) */}
        {userName && (
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100]">
                <div className="flex items-center justify-between px-2 py-2 glass-elite bg-surface/85 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300">
                    
                    <button 
                        onClick={toggleChatList}
                        className="relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 hover:bg-foreground/5"
                    >
                        <MessageSquare className="w-[22px] h-[22px] text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground mt-1">Chats</span>
                    </button>

                    <Link 
                        href="/feed"
                        className={`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 ${router.pathname === "/feed" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}`}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${router.pathname === "/feed" ? "text-primary" : "text-muted-foreground"}`}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <span className={`text-[10px] font-bold mt-1 transition-colors ${router.pathname === "/feed" ? "text-primary" : "text-muted-foreground"}`}>Feed</span>
                    </Link>

                    <Link 
                        href="/explore"
                        className={`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 ${router.pathname === "/explore" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}`}
                    >
                        <Compass className={`w-[22px] h-[22px] transition-colors ${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-bold mt-1 transition-colors ${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}`}>Explore</span>
                    </Link>

                    <Link 
                        href="/progress"
                        className={`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 ${router.pathname === "/progress" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}`}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${router.pathname === "/progress" ? "text-primary" : "text-muted-foreground"}`}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span className={`text-[10px] font-bold mt-1 transition-colors ${router.pathname === "/progress" ? "text-primary" : "text-muted-foreground"}`}>Progress</span>
                    </Link>

                    <Link 
                        href="/matches"
                        className={`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 ${router.pathname === "/matches" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}`}
                    >
                        <Users className={`w-[22px] h-[22px] transition-colors ${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-bold mt-1 transition-colors ${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}`}>Matches</span>
                    </Link>

                </div>
            </div>
        )}

        </>
    );
}
