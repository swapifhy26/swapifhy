const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Remove the standalone mobile logout button
const mobileLogout = `{/* MOBILE LOGOUT BUTTON */}
                        <button onClick={handleLogout} className="md:hidden ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </button>`;
code = code.replace(mobileLogout, '');

// 2. Change the wrapper to show on mobile, add gap
const hiddenWrapper = `<div className="hidden md:flex items-center pl-6 ml-2 border-l border-border/50 relative">`;
const newWrapper = `<div className="flex items-center gap-2 md:gap-0 pl-2 md:pl-6 ml-2 md:border-l border-border/50 relative">`;
code = code.replace(hiddenWrapper, newWrapper);

// 3. Make notification dropdown mobile-friendly
const oldNotifClass = `className="absolute top-12 right-[-80px] w-80 glass-elite bg-surface/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 py-3 z-50 flex flex-col"`;
const newNotifClass = `className="absolute top-12 -right-12 md:right-[-80px] w-[90vw] max-w-[320px] sm:w-80 glass-elite bg-surface/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 py-3 z-50 flex flex-col"`;
code = code.replace(oldNotifClass, newNotifClass);

// 4. Hide profile username text on mobile
const oldProfileName = `<span className={\`text-sm tracking-tight font-semibold transition-colors \${isDropdownOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'}\`}>`;
const newProfileName = `<span className={\`hidden md:inline text-sm tracking-tight font-semibold transition-colors \${isDropdownOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'}\`}>`;
code = code.replace(oldProfileName, newProfileName);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar beautified for mobile");
