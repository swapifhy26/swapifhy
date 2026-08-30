const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

const streakBarHTML = `
                {/* 🔥 DUOLINGO-STYLE STREAK BAR */}
                <div className="relative glass-card border border-border/50 rounded-[2.5rem] p-6 lg:p-10 mb-12 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative flex items-center gap-6">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse">
                            <span className="text-4xl lg:text-5xl drop-shadow-md">🔥</span>
                        </div>
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">
                                3-Day Streak!
                            </h2>
                            <p className="text-muted-foreground font-sans text-sm lg:text-base font-medium">
                                Come back tomorrow to keep your flame alive.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Rewards Progress</span>
                            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">Next: Pro Badge (7 Days)</span>
                        </div>
                        <div className="relative h-4 rounded-full bg-muted overflow-hidden mb-3 border border-border/50 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "42%" }} 
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                            >
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20 mix-blend-overlay"></div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                            <span className="text-orange-500">Day 1</span>
                            <span className="text-orange-500">Day 3 (You)</span>
                            <span>Day 7</span>
                        </div>
                    </div>
                </div>

                {/* Tab Toggle */}
`;

const targetStr = `                {/* Tab Toggle */}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, streakBarHTML);
    fs.writeFileSync('src/pages/progress.tsx', code);
    console.log("Injected Streak Bar");
} else {
    console.log("Could not find Tab Toggle to inject Streak bar.");
}
