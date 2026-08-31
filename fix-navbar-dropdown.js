const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/Navbar.tsx', 'utf8');

const badMatchesBlock = `                                            <Link 
                        href="/matches"
                        className={\`relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 active:scale-95 \${router.pathname === "/matches" ? "bg-primary/10 shadow-inner" : "hover:bg-foreground/5"}\`}
                    >
                        <Users className={\`w-[22px] h-[22px] transition-colors \${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}\`} />
                        <span className={\`text-[10px] font-bold mt-1 transition-colors \${router.pathname === "/matches" ? "text-primary" : "text-muted-foreground"}\`}>Matches</span>
                    </Link>`;

const goodProfileBlock = `                                            <Link 
                                                href="/dashboard" 
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface/80 hover:text-primary transition-colors flex items-center gap-3 w-full text-left"
                                            >
                                                <User className="w-4 h-4 text-primary" /> Profile
                                            </Link>`;

// We will do a generic replacement of anything that looks like that matches block between <AnimatePresence> ... <Link href="/settings">
// Let's use regex or string replace.
code = code.replace(/<Link \s*href="\/matches"\s*className={`relative flex flex-col items-center justify-center w-\[52px\] h-\[52px\] rounded-full transition-all duration-300 active:scale-95 \${router\.pathname === "\/matches" \? "bg-primary\/10 shadow-inner" : "hover:bg-foreground\/5"}`}\s*>\s*<Users className={`w-\[22px\] h-\[22px\] transition-colors \${router\.pathname === "\/matches" \? "text-primary" : "text-muted-foreground"}`} \/>\s*<span className={`text-\[10px\] font-bold mt-1 transition-colors \${router\.pathname === "\/matches" \? "text-primary" : "text-muted-foreground"}`}>Matches<\/span>\s*<\/Link>\s*<Link \s*href="\/settings"/, goodProfileBlock + '\n                                            <Link \n                                                href="/settings"');

fs.writeFileSync('frontend-v2/src/components/Navbar.tsx', code);
console.log("Fixed dropdown menu in Navbar");
