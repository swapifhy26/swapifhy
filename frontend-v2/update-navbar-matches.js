const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Import Users icon
code = code.replace(/import { LogOut, User, Compass, Zap, MessageSquare, Bell } from "lucide-react";/g, 'import { LogOut, User, Users, Compass, Zap, MessageSquare, Bell } from "lucide-react";');

// Replace Dashboard link with Matches link
const dashboardLinkRegex = /<Link[\s\n]*href="\/dashboard"[\s\S]*?<\/Link>/g;
const newMatchesLink = `<Link 
                        href="/matches"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/matches" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <Users className={\`w-[22px] h-[22px] transition-colors \${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}\`} />
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}\`}>Matches</span>
                    </Link>`;

code = code.replace(dashboardLinkRegex, newMatchesLink);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar.tsx to use Matches instead of Profile in the mobile nav.");
