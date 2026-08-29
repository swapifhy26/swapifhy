const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The block to replace
const pattern1 = /\{\s*userName\s*\?\s*\(\s*<div\s+className="hidden\s+md:flex\s+items-center\s+pl-6\s+ml-2\s+border-l\s+border-border\/50\s+relative">/;
const replacement1 = `{userName ? (
                        <>
                        {/* MOBILE LOGOUT BUTTON */}
                        <button onClick={handleLogout} className="md:hidden ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex items-center pl-6 ml-2 border-l border-border/50 relative">`;

// The closing block
const pattern2 = /<\/div>\s*<\/div>\s*\)\s*:\s*\(\s*<Link\s+href="\/auth"/;
const replacement2 = `                            </div>
                        </div>
                        </>
                    ) : (
                        <Link href="/auth"`;

if (pattern1.test(code) && pattern2.test(code)) {
    code = code.replace(pattern1, replacement1);
    code = code.replace(pattern2, replacement2);
    fs.writeFileSync('src/components/Navbar.tsx', code);
    console.log('Mobile logout button added to navbar (regex)');
} else {
    console.log('Pattern not found');
}
