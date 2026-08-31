const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

const regex = /const isLiked = post\.likes\?\.some\(\(l: any\) => l\.userId === activeUser\?\.id\) \|\| false;/;

const injection = `const isLiked = post.likes?.some((l: any) => l.userId === activeUser?.id) || false;

                            if (post.type === "ACHIEVEMENT") {
                                return (
                                    <motion.div
                                        key={post.id}
                                        variants={itemVariants}
                                        className="relative rounded-[2rem] overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-2xl group/post border border-white/10 mb-6"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        
                                        {/* Floating decorative elements */}
                                        <div className="absolute top-4 right-4 w-24 h-24 bg-white/20 blur-[40px] rounded-full"></div>
                                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-pink-500/30 blur-[50px] rounded-full"></div>

                                        <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center justify-center text-center">
                                            {/* Trophy Icon */}
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.4)] relative">
                                                <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-20"></div>
                                                <span className="text-3xl sm:text-4xl" dangerouslySetInnerHTML={{ __html: '&#x1F3C6;' }} />
                                            </div>
                                            
                                            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white mb-3 uppercase drop-shadow-md">
                                                Milestone Unlocked!
                                            </h3>
                                            
                                            <p className="text-lg sm:text-xl font-medium text-white/90 leading-relaxed max-w-lg mb-8" dangerouslySetInnerHTML={{ __html: post.content.replace(/\\*\\*(.*?)\\*\\*/g, '<span class="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md mx-1 border border-white/20">$1</span>').replace(/@(\\w+)/g, '<span class="text-pink-200 font-bold">@$1</span>') }} />
                                            
                                            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-xs font-bold text-white/80 uppercase tracking-widest shadow-lg">
                                                <span dangerouslySetInnerHTML={{ __html: '&#x2728;' }} /> Community Celebration
                                            </div>
                                        </div>
                                        
                                        {/* Action Bar */}
                                        <div className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => handleLike(post.id, isLiked)} className={\`flex items-center gap-2 text-sm font-bold transition-all \${isLiked ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]' : 'text-white/70 hover:text-white'}\`}>
                                                    <Heart className={\`w-5 h-5 \${isLiked ? 'fill-current' : ''}\`} />
                                                    {post.likes?.length || 0}
                                                </button>
                                                <button onClick={() => setActiveDropdownId(activeDropdownId === post.id ? null : post.id)} className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-all">
                                                    <MessageSquare className="w-5 h-5" />
                                                    {post.comments?.length || 0}
                                                </button>
                                            </div>
                                            <div className="text-xs font-bold text-white/50 tracking-wider">
                                                {formatDate(post.createdAt)}
                                            </div>
                                        </div>

                                        {/* Expandable Comments (Re-use existing UI but customized for dark post) */}
                                        <AnimatePresence>
                                            {activeDropdownId === post.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-black/60 backdrop-blur-2xl border-t border-white/10"
                                                >
                                                    <div className="p-6">
                                                        <div className="space-y-4 mb-6">
                                                            {post.comments?.map((comment: any) => (
                                                                <div key={comment.id} className="flex gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                                        {comment.user.avatarUrl ? (
                                                                            <img src={comment.user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                                                        ) : (
                                                                            <span className="text-xs font-bold text-white/80">{comment.user.name?.charAt(0) || "?"}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[12px] font-bold text-white/90">{comment.user.name}</span>
                                                                            <span className="text-[10px] text-white/40">{formatDate(comment.createdAt)}</span>
                                                                        </div>
                                                                        <p className="text-[13px] text-white/70">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-3 items-center">
                                                            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 overflow-hidden">
                                                                {activeUser?.avatarUrl && <img src={activeUser.avatarUrl} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="flex-1 relative flex items-center">
                                                                <input
                                                                    type="text"
                                                                    value={commentInputs[post.id] || ""}
                                                                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                                                                    placeholder="Congratulate them..."
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-[13px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                                                />
                                                                <button
                                                                    onClick={() => submitComment(post.id)}
                                                                    disabled={!commentInputs[post.id]?.trim()}
                                                                    className="absolute right-3 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
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
                            }`;

code = code.replace(regex, injection);
fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Injected ACHIEVEMENT post UI");
