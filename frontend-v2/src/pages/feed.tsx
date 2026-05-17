import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Briefcase, Zap, MessageSquare, Heart, Share2, MoreHorizontal, CheckCircle2, TrendingUp, Activity, Edit2, Archive, Trash2, X } from "lucide-react";
import { useRouter } from "next/router";
import { API_URL } from "../lib/api";
import { ChatPanel } from "../components/ChatPanel";

export default function SwapFeed() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState("UPDATE"); // UPDATE, OFFER, REQUEST, ACHIEVEMENT
    const [activeUser, setActiveUser] = useState<any>(null);
    const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [isFocused, setIsFocused] = useState(false);
    
    // CRUD States
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    
    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);

    const router = useRouter();

    const fetchFeed = async () => {
        setLoading(true);
        const token = localStorage.getItem("swapifhy_token");
        if (!token) { router.push("/auth"); return; }
        
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        setActiveUser(user);

        
        try {
            const res = await fetch(`${API_URL}/api/posts/stream`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : data.posts || []);
            } else {
                console.error(`Feed sync failed with status: ${res.status}`);
            }
        } catch (error) {
            console.error("Feed sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const token = localStorage.getItem("swapifhy_token");
        
        try {
            const res = await fetch(`${API_URL}/api/posts/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ content, type: postType })
            });

            if (res.ok) {
                const data = await res.json();
                setPosts([data, ...posts]);
                setContent("");
                setPostType("UPDATE");
            } else {
                console.error(`Broadcast failed with status: ${res.status}`);
            }
        } catch (error) {
            console.error("Broadcast failed", error);
        }
    };

    const handleDelete = async (postId: string) => {
        const token = localStorage.getItem("swapifhy_token");
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
                setActiveDropdownId(null);
            }
        } catch (error) { console.error("Archive failed", error); }
    };

    const handleArchive = async (postId: string) => {
        const token = localStorage.getItem("swapifhy_token");
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}/archive`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
                setActiveDropdownId(null);
            }
        } catch (error) { console.error("Archive failed", error); }
    };

    const saveEdit = async (postId: string) => {
        if (!editContent.trim()) return;
        const token = localStorage.getItem("swapifhy_token");
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ content: editContent })
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(posts.map(p => p.id === postId ? { ...p, content: data.content } : p));
                setEditingPostId(null);
            }
        } catch (error) { console.error("Edit failed", error); }
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        const token = localStorage.getItem("swapifhy_token");
        
        try {
            const method = isLiked ? "DELETE" : "POST";
            await fetch(`${API_URL}/api/engagement/like`, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ postId })
            });

            // Optimistic Update
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    const likes = isLiked ? p.likes.filter((l: any) => l.userId !== activeUser.id) 
                                        : [...p.likes, { userId: activeUser.id }];
                    return { ...p, likes };
                }
                return p;
            }));
        } catch (error) {
            console.error("Engagement handshake failed", error);
        }
    };

    const submitComment = async (postId: string) => {
        const commentText = commentInputs[postId];
        if (!commentText?.trim()) return;

        const token = localStorage.getItem("swapifhy_token");
        
        try {
            const res = await fetch(`${API_URL}/api/engagement/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ postId, content: commentText })
            });
            const data = await res.json();

            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), data] } : p));
                setCommentInputs(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) {
            console.error("Stream commit failed", error);
        }
    };

    const handleInitiateSync = async (receiverId: string) => {
        const token = localStorage.getItem("swapifhy_token");
        try {
            const res = await fetch(`${API_URL}/api/chat/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (res.ok && data.swapId) {
                setActiveSwapId(data.swapId);
                setIsChatOpen(true);
            }
        } catch (error) {
            console.error("Sync initiation failed", error);
        }
    };

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Stagger config for feed initialization
    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full min-h-screen bg-background relative overflow-x-hidden pt-32 pb-24 bg-grid">
            {/* AMBIENT EFFECTS */}
            <div className="mesh-orb-elite bg-primary left-[-10%] top-[10%] w-[50vw] h-[50vw]" />
            <div className="mesh-orb-elite bg-accent right-[-10%] top-[40%] w-[40vw] h-[40vw] animation-delay-2000" />
            
            <div className="max-w-[1080px] mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ─── LEFT CONTEXT: Mini Profile Overview (Col 1-3) ─── */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <div className="glass-elite rounded-2xl overflow-hidden sticky top-32">
                        <div className="h-20 bg-gradient-to-br from-primary/30 to-accent/20 relative border-b border-border/40" />
                        <div className="px-5 pb-6 relative text-center">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight leading-tight">Swap <span className="text-gradient">Feed</span></h1>
                                <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed">
                                    Discover new people and swap skills in the <span className="text-foreground italic">Swapifhy Hub</span>. 
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-surface border-[3px] border-background flex items-center justify-center text-xl font-bold text-foreground absolute -top-8 left-1/2 -translate-x-1/2 shadow-xl ring-2 ring-primary/20">
                                {activeUser?.name?.charAt(0) || "X"}
                            </div>
                            <h3 className="text-foreground font-bold text-base mt-10 tracking-tight">{activeUser?.name || "Node Root"}</h3>
                            <div className="flex items-center justify-center gap-1.5 mt-1 filter text-primary/80">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <p className="text-[12px] font-medium tracking-wide">Verified User</p>
                            </div>
                            
                            <hr className="border-t border-border/60 my-5" />
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors group" onClick={() => router.push('/network')}>
                                    <span className="group-hover:text-primary transition-colors">User Reach</span> 
                                    <span className="text-foreground font-tech">128</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors group">
                                    <span className="group-hover:text-accent transition-colors">Impressions</span> 
                                    <span className="text-foreground font-tech">1.2K</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors group">
                                    <span className="group-hover:text-secondary transition-colors">Platform Trust</span> 
                                    <span className="text-foreground font-tech">98%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN FEED (Col 4-9) ─── */}
                <div className="col-span-1 lg:col-span-6 space-y-8">
                    
                    {/* BROADCAST COMPOSER */}
                    <div className={`glass-elite rounded-2xl p-5 md:p-6 transition-all duration-300 ${isFocused ? 'ring-1 ring-primary/40 shadow-[0_0_30px_-5px_var(--color-primary)] shadow-primary/20' : ''}`}>
                    <h3 className="text-xl font-heading font-black text-foreground tracking-tighter uppercase italic">Share <span className="text-primary">Skills</span></h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60">Broadcast your learning needs to the network</p>
                        <form onSubmit={handleBroadcast} className="relative">
                            <div className="flex gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-foreground font-bold shrink-0 shadow-sm">
                                    {activeUser?.name?.charAt(0) || "U"}
                                </div>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="What do you want to learn or teach today?"
                                    className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground resize-none h-16 text-[14px] leading-relaxed pt-2.5 font-sans"
                                    required
                                />
                            </div>
                            
                            <hr className="border-border/60 my-4" />
                            
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {/* UPDATE, OFFER, REQUEST PILLS */}
                                    {(["UPDATE", "OFFER", "REQUEST"] as const).map((type) => {
                                        const isActive = postType === type;
                                        const typeColor = type === "OFFER" ? "secondary" : type === "REQUEST" ? "accent" : "primary";
                                        
                                        return (
                                            <button 
                                                key={type}
                                                type="button" 
                                                onClick={() => setPostType(type)} 
                                                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-tech transition-all duration-300 flex items-center gap-1.5
                                                    ${isActive 
                                                        ? `bg-${typeColor}/15 text-${typeColor} border-b border-${typeColor}/50 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)]` 
                                                        : `text-muted-foreground hover:bg-surface hover:text-foreground border border-transparent`
                                                    }`}
                                            >
                                                {isActive && <motion.div layoutId="broadcast-dot" className={`w-1.5 h-1.5 rounded-full bg-${typeColor}`} />}
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit" 
                                    disabled={!content.trim()} 
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white flex items-center gap-2 text-[13px] font-bold disabled:opacity-40 disabled:grayscale transition-all shadow-md hover:shadow-[0_0_20px_rgba(75,100,250,0.4)]"
                                >
                                    <span>Post</span>
                                    <Send className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </form>
                    </div>

                    {/* INTERACTIVE DATA STREAM */}
                    <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <h2 className="font-tech text-xs tracking-[0.2em] text-muted-foreground">ALL POSTS</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-[220px] rounded-2xl glass-elite animate-pulse" />)
                        ) : posts.length === 0 ? (
                            <motion.div variants={itemVariants} className="text-center py-24 glass-elite rounded-2xl">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <MessageSquare className="w-7 h-7 text-primary/80" />
                                </div>
                                <h3 className="text-lg font-heading text-foreground mb-1">No Posts Yet</h3>
                                <p className="text-sm font-medium text-muted-foreground">Be the first to share an event with your network.</p>
                            </motion.div>
                        ) : (
                            posts.map(post => {
                                const isLiked = post.likes?.some((l: any) => l.userId === activeUser?.id) || false;
                                const postColor = post.type === "OFFER" ? "text-secondary" : post.type === "REQUEST" ? "text-accent" : "text-primary";
                                const bgGlowRef = post.type === "OFFER" ? "from-secondary/10" : post.type === "REQUEST" ? "from-accent/10" : "from-primary/10";
                                
                                return (
                                    <motion.div 
                                        key={post.id} 
                                        variants={itemVariants}
                                        className="relative rounded-2xl glass-elite overflow-hidden transition-all duration-300 hover:border-border/80 group/post"
                                    >
                                        {/* Subtle colored glow gradient at the top indicating post type */}
                                        <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b ${bgGlowRef} to-transparent opacity-50 pointer-events-none`} />

                                        <div className="p-5 md:p-7 relative z-10">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 rounded-full bg-surface border-[1.5px] border-border flex items-center justify-center text-foreground font-bold hover:shadow-lg hover:border-primary/50 cursor-pointer transition-all">
                                                        {post.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[14px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-tight mb-1">{post.user.name}</h4>
                                                        <p className="text-[12px] text-muted-foreground font-medium font-tech tracking-wide">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-2.5 py-1 rounded-[6px] flex items-center gap-1.5 text-[10px] font-tech bg-surface/50 border border-border/80 ${postColor} backdrop-blur-md`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${postColor.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                                                        {post.type}
                                                    </div>
                                                    
                                                    {activeUser?.id === post.userId && (
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setActiveDropdownId(activeDropdownId === post.id ? null : post.id)}
                                                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                                                            >
                                                                <MoreHorizontal className="w-5 h-5" />
                                                            </button>
                                                            
                                                            <AnimatePresence>
                                                                {activeDropdownId === post.id && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                        className="absolute right-0 top-full mt-2 w-40 glass-elite rounded-xl border border-white/10 shadow-xl overflow-hidden z-20 flex flex-col py-1"
                                                                    >
                                                                        <button 
                                                                            onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setActiveDropdownId(null); }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-[12px] font-semibold text-foreground hover:bg-white/5 hover:border-l-primary hover:text-primary transition-all text-left"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" /> Edit Post
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleArchive(post.id)}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-[12px] font-semibold text-foreground hover:bg-white/5 hover:border-l-secondary hover:text-secondary transition-all text-left"
                                                                        >
                                                                            <Archive className="w-3.5 h-3.5" /> Archive
                                                                        </button>
                                                                        <hr className="border-t border-white/5 my-1" />
                                                                        <button 
                                                                            onClick={() => handleDelete(post.id)}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-[12px] font-semibold text-red-400 hover:bg-red-500/10 hover:border-l-red-500 transition-all text-left"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            {editingPostId === post.id ? (
                                                <div className="mb-7 bg-surface/50 rounded-xl border border-primary/30 p-1 relative">
                                                    <textarea 
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full bg-transparent text-[14.5px] leading-[1.7] text-foreground p-3 resize-none focus:outline-none min-h-[100px]"
                                                    />
                                                    <div className="flex justify-end gap-2 p-2 border-t border-white/5">
                                                        <button 
                                                            onClick={() => setEditingPostId(null)}
                                                            className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-white/5 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={() => saveEdit(post.id)}
                                                            className="px-4 py-2 rounded-lg text-xs font-bold bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-foreground/90 text-[14.5px] leading-[1.7] mb-7 whitespace-pre-wrap font-sans">{post.content}</p>
                                            )}

                                            {/* Restyled Action Bar */}
                                            <div className="flex items-center gap-2 border-t border-border/40 pt-4 mt-2">
                                                <motion.button 
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleLike(post.id, isLiked)} 
                                                    className={`flex-1 flex items-center justify-center gap-2.5 py-2 rounded-xl text-[12px] font-bold transition-all ${isLiked ? "text-primary bg-primary/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] border border-primary/20" : "text-muted-foreground border border-transparent hover:bg-surface hover:text-foreground hover:border-border/50"}`}
                                                >
                                                    <motion.div animate={isLiked ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                                                        <Heart className={`w-4 h-4 ${isLiked ? "fill-primary" : ""}`} /> 
                                                    </motion.div>
                                                    <span>{post.likes?.length > 0 ? post.likes.length : ""} Like</span>
                                                </motion.button>
                                                                          <button onClick={() => toggleComments(post.id)} className={`flex-1 flex items-center justify-center gap-2.5 py-2 rounded-xl text-[12px] font-bold transition-all border border-transparent ${expandedComments[post.id] ? "bg-surface text-foreground border-border/50" : "text-muted-foreground hover:bg-surface hover:text-foreground hover:border-border/50"}`}>
                                                    <MessageSquare className="w-4 h-4" /> 
                                                    <span>{post.comments?.length > 0 ? post.comments.length : ""} Comment</span>
                                                </button>

                                                {activeUser?.id !== post.userId && (
                                                    <button 
                                                        onClick={() => handleInitiateSync(post.userId)}
                                                        className="flex-1 flex items-center justify-center gap-2.5 py-2 rounded-xl text-[12px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all"
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        <span>Swap</span>
                                                    </button>
                                                )}
                                                
                                                <button className="w-12 flex items-center justify-center py-2 rounded-xl text-muted-foreground border border-transparent hover:bg-surface hover:text-foreground hover:border-border/50 transition-all group/share">
                                                    <Share2 className="w-4 h-4 group-hover/share:rotate-12 transition-transform" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* EXPANDABLE COMMENT SECTION */}
                                        <AnimatePresence>
                                            {expandedComments[post.id] && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: "auto", opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }} 
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="bg-surface/30 border-t border-border/40 overflow-hidden"
                                                >
                                                    <div className="p-5 md:p-7 space-y-5">
                                                        {post.comments?.length > 0 ? (
                                                            post.comments.map((comment: any) => (
                                                                <div key={comment.id} className="flex gap-3.5">
                                                                    <div className="w-8 h-8 rounded-full bg-background border border-border shrink-0 flex items-center justify-center text-[10px] font-bold text-foreground mt-0.5 shadow-sm">
                                                                        {comment.user.name.charAt(0)}
                                                                    </div>
                                                                    <div className="bg-surface/60 px-4 py-3 rounded-2xl rounded-tl-sm border border-border/40 min-w-[30%] max-w-[90%] shadow-sm backdrop-blur-md">
                                                                        <h5 className="text-[12px] font-bold text-foreground mb-1">{comment.user.name}</h5>
                                                                        <p className="text-[13px] text-foreground/80 leading-relaxed font-sans">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs font-tech text-muted-foreground text-center py-2 uppercase tracking-wider">No comments yet</p>
                                                        )}

                                                        <div className="flex gap-3.5 mt-6 pt-4 border-t border-border/30">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shrink-0 flex items-center justify-center text-[11px] font-bold text-foreground mt-0.5 shadow-sm">
                                                                {activeUser?.name?.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 relative flex items-center">
                                                                <input 
                                                                    type="text" 
                                                                    value={commentInputs[post.id] || ""}
                                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                                                    placeholder="Write a comment..." 
                                                                    className="w-full bg-background border border-border/80 rounded-xl pl-4 pr-12 py-2.5 text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-sans"
                                                                />
                                                                <button 
                                                                    onClick={() => submitComment(post.id)}
                                                                    disabled={!commentInputs[post.id]?.trim()}
                                                                    className="absolute right-3 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </div>

                {/* ─── RIGHT CONTEXT: Synergy Suggestions (Col 10-12) ─── */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <div className="glass-elite rounded-2xl p-6 sticky top-32">
                        <div className="flex items-center gap-2.5 mb-6">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h4 className="font-tech text-xs tracking-widest text-foreground">SOME MATCHES FOR YOU</h4>
                        </div>
                        
                        <div className="space-y-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3.5 group cursor-pointer transition-all hover:bg-surface p-2.5 rounded-xl -mx-2 border border-transparent hover:border-border/50">
                                    <div className="w-10 h-10 rounded-full bg-background border border-border/80 shrink-0 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 group-hover:shadow-[0_0_15px_rgba(75,100,250,0.2)] transition-all" />
                                    <div className="flex-1">
                                        <div className="h-2.5 w-3/4 bg-border/50 rounded mb-2.5 group-hover:bg-primary/50 transition-colors" />
                                        <div className="h-2 w-1/2 bg-border/20 rounded" />
                                    </div>
                                    <div className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-foreground group-hover:bg-background transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-2.5 rounded-xl bg-surface border border-border/80 hover:bg-border/50 hover:border-border text-[12px] font-bold tracking-wide text-foreground transition-all shadow-sm">
                            View More
                        </button>
                    </div>
                </div>

            </div>

            {/* CHAT INTERFACE OVERLAY */}
            {isChatOpen && activeSwapId && (
                <ChatPanel 
                    swapId={activeSwapId} 
                    onClose={() => setIsChatOpen(false)} 
                    currentUserId={activeUser?.id} 
                />
            )}
        </div>
    );
}

