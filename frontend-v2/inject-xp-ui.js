const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

// Update stats
code = code.replace(
    'currentStreak: 0, highestStreak: 0 });',
    'currentStreak: 0, highestStreak: 0, xp: 0 });'
);
code = code.replace(
    'highestStreak: profData.user.highestStreak ?? 0',
    'highestStreak: profData.user.highestStreak ?? 0,\n                    xp: profData.user.xp ?? 0'
);

// Inject XP Bar HTML right below the Streak bar or above it.
const xpBarHTML = `
                {/* 🌟 LEVELING SYSTEM (XP BAR) */}
                <div className="relative glass-card border border-border/50 rounded-[2.5rem] p-6 lg:p-10 mb-6 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative flex items-center gap-6 w-full md:w-auto">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)] border-4 border-yellow-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-900/80 mb-[-4px]">Level</span>
                            <span className="text-4xl lg:text-5xl font-black text-yellow-950 drop-shadow-sm">{Math.floor(stats.xp / 1000) + 1}</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">
                                {stats.xp >= 1000 ? "Elite Scholar!" : "Keep Grinding!"}
                            </h2>
                            <p className="text-muted-foreground font-sans text-sm lg:text-base font-medium">
                                Earn XP by completing swaps and helping others.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Current XP</span>
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">{stats.xp} / { (Math.floor(stats.xp / 1000) + 1) * 1000 } XP</span>
                        </div>
                        <div className="relative h-4 rounded-full bg-muted overflow-hidden mb-3 border border-border/50 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: \`\${(stats.xp % 1000) / 10}%\` }} 
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                            >
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                            <span className="text-amber-500">Level {Math.floor(stats.xp / 1000) + 1}</span>
                            <span>Level {Math.floor(stats.xp / 1000) + 2}</span>
                        </div>
                    </div>
                </div>
`;

code = code.replace(
    '{/* 🔥 DUOLINGO-STYLE STREAK BAR */}',
    xpBarHTML + '\n                {/* 🔥 DUOLINGO-STYLE STREAK BAR */}'
);

fs.writeFileSync('src/pages/progress.tsx', code);

// Navbar script
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!navCode.includes('const [userXp, setUserXp]')) {
    navCode = navCode.replace(
        'const [avatarUrl, setAvatarUrl] = useState<string | null>(null);',
        'const [avatarUrl, setAvatarUrl] = useState<string | null>(null);\n    const [userXp, setUserXp] = useState<number>(0);'
    );
    
    navCode = navCode.replace(
        'setAvatarUrl(data.user.avatarUrl);',
        'setAvatarUrl(data.user.avatarUrl);\n                        setUserXp(data.user.xp || 0);'
    );
    
    // Replace the desktop profile image border logic
    // We search for `<div className={\`w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30`
    navCode = navCode.replace(
        /<div className=\{\`w-\[34px\] h-\[34px\] rounded-full bg-gradient-to-br from-primary\/30 to-secondary\/30 overflow-hidden border flex items-center justify-center text-foreground font-bold text-sm shadow-sm \$\{.*?\}\`\}>/g,
        `<div className={\`w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden flex items-center justify-center text-foreground font-bold text-sm shadow-sm \${userXp >= 1000 ? "border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]" : "border border-border"} \${isDropdownOpen ? "ring-2 ring-primary border-transparent" : ""}\`}>`
    );

    // Replace the mobile profile image border logic
    navCode = navCode.replace(
        /<div className=\{\`w-\[24px\] h-\[24px\] rounded-full bg-gradient-to-br from-primary\/30 to-secondary\/30 overflow-hidden border transition-all \$\{router\.pathname === "\/dashboard" \? "border-primary shadow-\[0_0_8px_rgba\(75,100,250,0\.4\)\]" : "border-border\/50"\}\`\}>/g,
        `<div className={\`w-[24px] h-[24px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden transition-all \${userXp >= 1000 ? "border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]" : (router.pathname === "/dashboard" ? "border border-primary shadow-[0_0_8px_rgba(75,100,250,0.4)]" : "border border-border/50")}\`}>`
    );

    fs.writeFileSync('src/components/Navbar.tsx', navCode);
}

console.log("Injected Leveling System logic into frontend.");
