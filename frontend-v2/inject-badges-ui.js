const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

const badgesHTML = `
                            {/* Achievements & Badges Grid */}
                            <div className="glass-elite p-8 rounded-3xl mt-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" /> Achievements & Badges
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {BADGE_DEFINITIONS.map(badge => {
                                        const isUnlocked = badge.check(stats);
                                        return (
                                            <div key={badge.id} className={\`p-4 rounded-2xl flex flex-col items-center text-center transition-all \${isUnlocked ? "bg-background/80 border border-border/50 shadow-lg hover:scale-105" : "bg-background/20 border border-border/20 opacity-50 grayscale hover:opacity-70"}\`}>
                                                <div className={\`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner \${isUnlocked ? badge.color + " text-white shadow-[0_0_15px_currentColor]" : "bg-muted text-muted-foreground"}\`}>
                                                    {badge.icon}
                                                </div>
                                                <p className="font-bold text-sm mb-1 leading-tight">{badge.name}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground leading-tight">{badge.description}</p>
                                                {isUnlocked && <span className="mt-3 text-[9px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-sm">Unlocked</span>}
                                                {!isUnlocked && <span className="mt-3 text-[9px] font-black tracking-widest uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm"><Lock className="w-2 h-2 inline mr-1" />Locked</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Swap Requests Bar */}
`;

const replaceStr = `                            {/* Swap Requests Bar */}`;

if (code.includes(replaceStr)) {
    code = code.replace(replaceStr, badgesHTML.trim());
    fs.writeFileSync('src/pages/progress.tsx', code);
    console.log("Injected Badges UI grid");
} else {
    console.log("Could not find anchor to inject Badges UI");
}
