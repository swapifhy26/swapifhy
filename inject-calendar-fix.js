const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

const streakCalendarContent = `
                        {activeModal === "streakCalendar" && (
                            <div className="text-center pt-2">
                                <div className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
                                    <Flame className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="text-2xl font-black font-heading tracking-tight">Streak Calendar</h3>
                                <p className="text-muted-foreground text-sm mt-1 mb-6">You're on a {stats.currentStreak}-day streak!</p>

                                <div className="bg-background rounded-2xl p-4 border border-border/50">
                                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i}>{d}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {[...Array(7)].map((_, i) => {
                                            const date = new Date();
                                            date.setDate(date.getDate() - (6 - i));
                                            
                                            let isLit = false;
                                            if (isStreakMarkedToday()) {
                                                isLit = (6 - i) < stats.currentStreak;
                                            } else {
                                                if (i === 6) isLit = false;
                                                else isLit = (5 - i) < stats.currentStreak;
                                            }
                                            
                                            const isToday = i === 6;

                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1">
                                                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 \${isLit ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white scale-110' : 'bg-muted text-muted-foreground border border-border/50'}\`}>
                                                        {isLit ? <Flame className="w-5 h-5 fill-current" /> : <span className="font-bold text-xs">{date.getDate()}</span>}
                                                    </div>
                                                    {isToday && <span className="text-[10px] font-bold text-orange-500">TODAY</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between items-center text-sm font-bold bg-muted/50 p-4 rounded-xl">
                                    <div className="flex flex-col text-left">
                                        <span className="text-muted-foreground text-xs uppercase tracking-widest">Highest</span>
                                        <span className="text-lg">{stats.highestStreak} Days</span>
                                    </div>
                                    <Award className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                        )}
`;

code = code.replace(
    '{activeModal === "resource" && (',
    streakCalendarContent.trim() + '\n\n                        {activeModal === "resource" && ('
);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Re-injected streak calendar content");
