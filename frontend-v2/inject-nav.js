const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The bottom navbar code we want to append for mobile users.
// We'll only show this if the user is logged in (userName exists).
// If not logged in, we might still want a bottom nav, but let's just mimic the main links.
const mobileNavCode = `
        {/* MOBILE BOTTOM NAVIGATION (GLASSMORPHIC PILL) */}
        {userName && (
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100]">
                <div className="flex items-center justify-between px-2 py-2 bg-black/80 dark:bg-black/90 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                    
                    <button 
                        onClick={toggleChatList}
                        className="relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 hover:bg-white/10"
                    >
                        <MessageSquare className="w-5 h-5 text-gray-300" />
                        <span className="text-[10px] font-medium text-gray-400 mt-1">Chats</span>
                    </button>

                    <Link 
                        href="/feed"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 \${router.pathname === "/feed" ? "bg-white/10" : "hover:bg-white/10"}\`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={\`w-5 h-5 \${router.pathname === "/feed" ? "text-blue-400" : "text-gray-300"}\`}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <span className={\`text-[10px] font-medium mt-1 \${router.pathname === "/feed" ? "text-blue-400" : "text-gray-400"}\`}>Feed</span>
                    </Link>

                    <Link 
                        href="/explore"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 \${router.pathname === "/explore" ? "bg-white/10" : "hover:bg-white/10"}\`}
                    >
                        <Compass className={\`w-5 h-5 \${router.pathname === "/explore" ? "text-blue-400" : "text-gray-300"}\`} />
                        <span className={\`text-[10px] font-medium mt-1 \${router.pathname === "/explore" ? "text-blue-400" : "text-gray-400"}\`}>Explore</span>
                    </Link>

                    <Link 
                        href="/dashboard"
                        className="relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 hover:bg-white/10"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden border border-border/50">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                                    {userName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 mt-1">Profile</span>
                    </Link>

                </div>
            </div>
        )}
`;

// Replace `return (` with `return ( <>`
const returnRegex = /return\s*\(\s*<nav/g;
if (returnRegex.test(code)) {
    code = code.replace(returnRegex, 'return (\n        <>\n        <nav');
    
    // Find the last `</nav>` and append the mobileNavCode + `</>`
    const lastNavIndex = code.lastIndexOf('</nav>');
    if (lastNavIndex !== -1) {
        code = code.slice(0, lastNavIndex + 6) + '\n' + mobileNavCode + '\n        </>' + code.slice(lastNavIndex + 6);
    }
    
    fs.writeFileSync('src/components/Navbar.tsx', code);
    console.log("Navbar modified!");
} else {
    console.log("Could not find return statement");
}
