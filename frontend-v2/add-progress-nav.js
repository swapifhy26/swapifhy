const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const exploreLink = `                    <Link 
                        href="/explore"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/explore" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <Compass className={\`w-[22px] h-[22px] transition-colors \${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}\`} />
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/explore" ? "text-primary" : "text-muted-foreground"}\`}>Explore</span>
                    </Link>`;

const progressLink = `

                    <Link 
                        href="/progress"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/progress" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={\`transition-colors \${router.pathname === "/progress" ? "text-primary" : "text-muted-foreground"}\`}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/progress" ? "text-primary" : "text-muted-foreground"}\`}>Progress</span>
                    </Link>`;

if (code.includes(exploreLink)) {
    code = code.replace(exploreLink, exploreLink + progressLink);
    fs.writeFileSync('src/components/Navbar.tsx', code);
    console.log('Progress link added to bottom nav');
} else {
    console.log('Could not find explore link in navbar');
}
