const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Use regex to find the mobile bottom nav code and replace it with a better theme-aware one.
const oldNavStart = '{/* MOBILE BOTTOM NAVIGATION (GLASSMORPHIC PILL) */}';
const newMobileNavCode = `
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
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/feed" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={\`transition-colors \${router.pathname === "/feed" ? "text-primary" : "text-muted-foreground"}\`}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/feed" ? "text-primary" : "text-muted-foreground"}\`}>Feed</span>
                    </Link>

                    <Link 
                        href="/explore"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/explore" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <Compass className={\`w-[22px] h-[22px] transition-colors \${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}\`} />
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}\`}>Explore</span>
                    </Link>

                    <Link 
                        href="/dashboard"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/dashboard" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <div className={\`w-[24px] h-[24px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden border transition-all \${router.pathname === "/dashboard" ? "border-primary shadow-[0_0_8px_rgba(75,100,250,0.4)]" : "border-border/50"}\`}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-foreground text-[10px] font-bold">
                                    {userName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}\`}>Profile</span>
                    </Link>

                </div>
            </div>
        )}
`;

const splitIdx = code.indexOf(oldNavStart);
if (splitIdx !== -1) {
    const endIdx = code.indexOf('</>', splitIdx);
    if (endIdx !== -1) {
        code = code.slice(0, splitIdx) + newMobileNavCode + '\n        ' + code.slice(endIdx);
        fs.writeFileSync('src/components/Navbar.tsx', code);
        console.log("Updated to use semantic UI classes");
    }
} else {
    console.log("Could not find the old block");
}
