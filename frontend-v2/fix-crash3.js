const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const replacement = `{notifications.length === 0 ? (
    <div className="p-4 text-center text-xs text-muted-foreground">No notifications yet.</div>
) : (
    notifications.map((n) => (
        <div key={n.id} onClick={() => handleNotificationClick(n)} className={\`p-3 rounded-xl transition-colors cursor-pointer \${n.isRead ? 'opacity-60 hover:bg-foreground/5' : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'}\`}>
            <p className="text-xs font-medium text-foreground leading-snug">{n.message}</p>
            <p className="text-[9px] text-muted-foreground mt-1.5 uppercase tracking-widest font-bold opacity-70">
                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
        </div>
    ))
)}`;

code = code.replace(/\{MOCK_NOTIFICATIONS\.map[\s\S]*?\}\)\)/, replacement);

// ALSO verify API_URL is imported!
if (!code.includes('import { API_URL }')) {
    code = code.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport { API_URL } from "../lib/api";');
}

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log('Replaced correctly');
