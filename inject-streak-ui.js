const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

// 1. Add `lastStreakDate` to stats state
code = code.replace(
    'currentStreak: 0, highestStreak: 0, xp: 0 });',
    'currentStreak: 0, highestStreak: 0, xp: 0, lastStreakDate: "" });'
);
code = code.replace(
    'xp: profData.user.xp ?? 0',
    'xp: profData.user.xp ?? 0,\n                    lastStreakDate: profData.user.lastStreakDate || ""'
);

// 2. Add `handleMarkStreak` and `isStreakMarkedToday`
const streakLogic = `
    const isStreakMarkedToday = () => {
        if (!stats.lastStreakDate) return false;
        const now = new Date();
        const last = new Date(stats.lastStreakDate);
        return now.toISOString().split('T')[0] === last.toISOString().split('T')[0];
    };

    const handleMarkStreak = async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/user/streak/mark\`, {
                method: "POST",
                headers: { "Authorization": \`Bearer \${token}\` }
            });
            const d = await res.json();
            if (res.ok) {
                setStats(s => ({ ...s, currentStreak: d.currentStreak, highestStreak: d.highestStreak, lastStreakDate: d.lastStreakDate }));
                // Trigger a confetti or bump effect here via state
                const el = document.getElementById('streak-flame');
                if (el) {
                    el.classList.add('animate-bounce');
                    setTimeout(() => el.classList.remove('animate-bounce'), 1000);
                }
            } else {
                alert(d.error || "Failed to mark streak");
            }
        } catch (e) {
            console.error(e);
        }
    };
`;

code = code.replace(
    'const fetchData = async () => {',
    streakLogic + '\n    const fetchData = async () => {'
);

// 3. Update the Streak UI
const streakUI = `
                          <div>
                              <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">
                                  {stats.currentStreak}-Day Streak!
                              </h2>
                              {!isStreakMarkedToday() ? (
                                  <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleMarkStreak}
                                      className="mt-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] flex items-center gap-2 group"
                                  >
                                      <Flame className="w-4 h-4 group-hover:animate-pulse" />
                                      Mark Today's Streak
                                  </motion.button>
                              ) : (
                                  <p className="text-muted-foreground font-sans text-sm lg:text-base font-medium flex items-center gap-1.5 text-orange-500">
                                      <CheckCircle2 className="w-4 h-4" /> Streak secured! Come back tomorrow.
                                  </p>
                              )}
                          </div>
                      </div>
                      
                      <div 
                          className="relative flex-1 w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 cursor-pointer hover:border-orange-500/50 transition-colors"
                          onClick={() => setActiveModal("streakCalendar")}
                      >
`;

code = code.replace(
    /<div>\s*<h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tighter text-foreground mb-1">\s*\{stats\.currentStreak\}-Day Streak!\s*<\/h2>\s*<p className="text-muted-foreground font-sans text-sm lg:text-base font-medium">\s*Come back tomorrow to keep your flame alive\.\s*<\/p>\s*<\/div>\s*<\/div>\s*<div className="relative flex-1 w-full max-w-md bg-background\/50 backdrop-blur-xl border border-border\/50 rounded-2xl p-6">/g,
    streakUI.trim()
);

// Add an ID to the flame icon for the bounce effect
code = code.replace(
    '<div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center rotate-3 transform group-hover:rotate-6 transition-transform">',
    '<div id="streak-flame" className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center rotate-3 transform transition-transform duration-300">'
);


// 4. Inject the Streak Calendar Modal
const calendarModal = `
              <AnimatePresence>
                  {activeModal === "streakCalendar" && (
                      <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                          onClick={() => setActiveModal(null)}
                      >
                          <motion.div
                              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                              className="bg-card w-full max-w-md rounded-3xl p-6 border border-border/50 shadow-2xl relative overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                          >
                              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
                                  <X className="w-4 h-4" />
                              </button>
                              
                              <div className="text-center mb-6 pt-4">
                                  <div className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
                                      <Flame className="w-8 h-8 text-orange-500" />
                                  </div>
                                  <h3 className="text-2xl font-black font-heading tracking-tight">Streak Calendar</h3>
                                  <p className="text-muted-foreground text-sm mt-1">You're on a {stats.currentStreak}-day streak!</p>
                              </div>

                              <div className="bg-background rounded-2xl p-4 border border-border/50">
                                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i}>{d}</div>)}
                                  </div>
                                  <div className="grid grid-cols-7 gap-2">
                                      {[...Array(7)].map((_, i) => {
                                          // Fake logic for the past 7 days based on currentStreak
                                          const date = new Date();
                                          date.setDate(date.getDate() - (6 - i));
                                          
                                          // A day is "lit" if it falls within the current streak count
                                          // Note: this is a fun UI approximation like Duolingo uses for the "current week" view
                                          let isLit = false;
                                          if (isStreakMarkedToday()) {
                                              isLit = (6 - i) < stats.currentStreak;
                                          } else {
                                              if (i === 6) isLit = false; // today is not marked
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
                                  <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs uppercase tracking-widest">Highest</span>
                                      <span className="text-lg">{stats.highestStreak} Days</span>
                                  </div>
                                  <Award className="w-8 h-8 text-yellow-500" />
                              </div>
                          </motion.div>
                      </motion.div>
                  )}
              </AnimatePresence>
`;

code = code.replace(
    '</AnimatePresence>\n          </div>\n      </>\n  );\n}',
    calendarModal + '\n              </AnimatePresence>\n          </div>\n      </>\n  );\n}'
);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Injected Streak marking UI and Calendar");
