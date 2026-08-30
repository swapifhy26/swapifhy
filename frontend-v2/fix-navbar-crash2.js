const fs = require('fs');

const file = 'src/components/Navbar.tsx';
let code = fs.readFileSync(file, 'utf8');

const startIndex = code.indexOf('{MOCK_NOTIFICATIONS.map');
const endIndex = code.indexOf('))}</div>', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newMapStr = `{notifications.length === 0 ? (
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
    
    // endIndex points to '))}</div>'. The block ends at '))}'. 
    // We want to replace from startIndex to the end of '))}'.
    // We can just use a regex /\{MOCK_NOTIFICATIONS\.map[\s\S]*?\}\)\)/
    code = code.replace(/\{MOCK_NOTIFICATIONS\.map[\s\S]*?\}\)\)/, newMapStr);
    
    fs.writeFileSync(file, code);
    console.log('Fixed MOCK_NOTIFICATIONS error using regex');
} else {
    console.log('Could not find indices', startIndex, endIndex);
}
