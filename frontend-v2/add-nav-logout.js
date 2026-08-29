const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const target = `                    {userName ? (
                        <div className="hidden md:flex items-center pl-6 ml-2 border-l border-border/50 relative">`;

const replacement = `                    {userName ? (
                        <>
                        {/* MOBILE LOGOUT BUTTON */}
                        <button onClick={handleLogout} className="md:hidden ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex items-center pl-6 ml-2 border-l border-border/50 relative">`;

const closingTarget = `                            </div>
                        </div>
                    ) : (`;

const closingReplacement = `                            </div>
                        </div>
                        </>
                    ) : (`;

if (code.includes(target) && code.includes(closingTarget)) {
    code = code.replace(target, replacement);
    code = code.replace(closingTarget, closingReplacement);
    fs.writeFileSync('src/components/Navbar.tsx', code);
    console.log('Mobile logout button added to navbar');
} else {
    console.log('Target not found');
}
