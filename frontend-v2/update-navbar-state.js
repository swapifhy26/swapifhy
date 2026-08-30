const fs = require('fs');

let navbarTs = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const regex = /const \[isNotificationOpen, setIsNotificationOpen\] = useState\(false\);/;
const newStateBlock = `const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
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
            window.location.href = n.link;
        }
    };`;

if (!navbarTs.includes('const [notifications, setNotifications] = useState')) {
    navbarTs = navbarTs.replace(regex, newStateBlock);
    fs.writeFileSync('src/components/Navbar.tsx', navbarTs);
    console.log('Successfully injected state');
}
