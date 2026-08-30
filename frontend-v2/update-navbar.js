const fs = require('fs');

let navbarTs = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Remove MOCK_NOTIFICATIONS
const mockDataRegex = /\/\/ MOCK DATA[\s\S]*?\];/;
if (mockDataRegex.test(navbarTs)) {
    navbarTs = navbarTs.replace(mockDataRegex, '');
}

// 2. Add state and fetch logic
const stateBlock = `    // Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);`;

const newStateBlock = `    // Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch Notifications
    useEffect(() => {
        if (userName) {
            const fetchNotifs = () => {
                const token = localStorage.getItem("swapifhy_token");
                if (!token) return;
                fetch(\`\${API_URL}/api/notifications\`, {
                    headers: { "Authorization": \`Bearer \${token}\` }
                })
                .then(r => r.json())
                .then(d => {
                    if (d.notifications) setNotifications(d.notifications);
                    if (d.unreadCount !== undefined) setUnreadCount(d.unreadCount);
                })
                .catch(() => {});
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 15000); // 15s poll
            return () => clearInterval(interval);
        }
    }, [userName]);

    const markAllRead = () => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) return;
        fetch(\`\${API_URL}/api/notifications/read-all\`, {
            method: "PUT",
            headers: { "Authorization": \`Bearer \${token}\` }
        }).then(() => {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });
    };

    const handleNotificationClick = (n: any) => {
        if (!n.isRead) {
            const token = localStorage.getItem("swapifhy_token");
            fetch(\`\${API_URL}/api/notifications/\${n.id}/read\`, {
                method: "PUT",
                headers: { "Authorization": \`Bearer \${token}\` }
            }).then(() => {
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            });
        }
        setIsNotificationOpen(false);
        if (n.link) {
            router.push(n.link);
        }
    };`;

if (navbarTs.includes(stateBlock)) {
    navbarTs = navbarTs.replace(stateBlock, newStateBlock);
} else {
    console.log("Could not find state block");
}

// 3. Update the UI
// Replace Bell indicator
const bellIndicatorRegex = /<span className="absolute top-1\.5 right-1\.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-\[\S+\]" \/>/;
const newBellIndicator = `{unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(75,100,250,0.8)]" />
                                    )}`;

if (bellIndicatorRegex.test(navbarTs)) {
    navbarTs = navbarTs.replace(bellIndicatorRegex, newBellIndicator);
}

// Replace the Mark Read button
const markReadBtn = `<button className="text-[10px] font-bold text-primary hover:underline transition-all">Mark read</button>`;
const newMarkReadBtn = `<button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline transition-all">Mark read</button>`;
navbarTs = navbarTs.replace(markReadBtn, newMarkReadBtn);

// Replace mapping block
const mapBlockRegex = /\{MOCK_NOTIFICATIONS\.map\(\(n\) => \([\s\S]*?\}\)\)/;
const newMapBlock = `{notifications.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-muted-foreground">No notifications yet.</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div 
                                                        key={n.id} 
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={\`p-3 rounded-xl transition-colors cursor-pointer \${n.isRead ? 'opacity-60 hover:bg-foreground/5' : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'}\`}
                                                    >
                                                        <p className="text-xs font-medium text-foreground leading-snug">{n.message}</p>
                                                        <p className="text-[9px] text-muted-foreground mt-1.5 uppercase tracking-widest font-bold opacity-70">
                                                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                ))
                                            )}`;

if (mapBlockRegex.test(navbarTs)) {
    navbarTs = navbarTs.replace(mapBlockRegex, newMapBlock);
}

// Fix imports: API_URL needs to be imported if not present
if (!navbarTs.includes('API_URL')) {
    navbarTs = navbarTs.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport { API_URL } from "../lib/api";');
}

fs.writeFileSync('src/components/Navbar.tsx', navbarTs);
console.log('Updated Navbar.tsx');
