const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/components/Navbar.tsx', 'utf8');

// Add HelpCircle to lucide-react imports
code = code.replace(
    /import \{ LogOut, User, Users, Compass, Zap, MessageSquare, Bell \} from "lucide-react";/,
    'import { LogOut, User, Users, Compass, Zap, MessageSquare, Bell, HelpCircle } from "lucide-react";'
);

// Add the link to the dropdown
const preferencesRegex = /<Link\s*href="\/settings"[\s\S]*?<\/Link>/;

const helpLink = `<Link 
                                                href="/help" 
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface/80 hover:text-emerald-400 transition-colors flex items-center gap-3 w-full text-left"
                                            >
                                                <HelpCircle className="w-4 h-4 text-emerald-400" /> Help & Support
                                            </Link>`;

code = code.replace(preferencesRegex, (match) => `${match}\n                                            ${helpLink}`);

fs.writeFileSync('frontend-v2/src/components/Navbar.tsx', code);
console.log("Added Help to Navbar");
