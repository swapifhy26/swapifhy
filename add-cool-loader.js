const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

const loaderJSX = `
    if (!loaded) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Animated Background Gradients */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-teal-500/20 rounded-full blur-[120px]"
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-rose-500/20 rounded-full blur-[100px]"
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Pulsing Logo/Icon */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-tr from-teal-500 to-rose-500 p-0.5 shadow-[0_0_50px_rgba(20,184,166,0.3)] relative"
                    >
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl rounded-3xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <defs>
                                        <linearGradient id="paint0_linear" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#14B8A6"/>
                                            <stop offset="1" stopColor="#F43F5E"/>
                                        </linearGradient>
                                        <linearGradient id="paint1_linear" x1="2" y1="19.5" x2="22" y2="19.5" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#14B8A6"/>
                                            <stop offset="1" stopColor="#F43F5E"/>
                                        </linearGradient>
                                        <linearGradient id="paint2_linear" x1="2" y1="14.5" x2="22" y2="14.5" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#14B8A6"/>
                                            <stop offset="1" stopColor="#F43F5E"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Animated Text */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl font-heading font-black text-white tracking-tight mb-2">Syncing Your Hub</h2>
                        <motion.div className="flex items-center gap-2 justify-center h-6 overflow-hidden">
                            <motion.span 
                                animate={{ y: [0, -24, -48, -72, -96, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "anticipate" }}
                                className="flex flex-col text-sm font-bold text-muted-foreground/80 tracking-widest uppercase"
                            >
                                <span className="h-6 flex items-center">Loading Streaks...</span>
                                <span className="h-6 flex items-center">Fetching Mentorships...</span>
                                <span className="h-6 flex items-center">Syncing Swap Requests...</span>
                                <span className="h-6 flex items-center">Calculating XP...</span>
                                <span className="h-6 flex items-center">Almost Ready...</span>
                                <span className="h-6 flex items-center">Loading Streaks...</span>
                            </motion.span>
                        </motion.div>
                    </motion.div>

                    {/* Loading Bar */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="w-48 h-1 bg-white/5 rounded-full mt-8 overflow-hidden relative"
                    >
                        <motion.div 
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full"
                        />
                    </motion.div>
                </div>
            </div>
        );
    }
`;

code = code.replace(
    /if \(!loaded\) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"><\/div><\/div>;/,
    loaderJSX
);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Updated progress.tsx with a very cool loading interface");
