const fs = require('fs');

const file = 'src/components/Navbar.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldMapStr = `{MOCK_NOTIFICATIONS.map((n) => (
                                                    <div key={n.id} className="p-3 rounded-xl hover:bg-foreground/5 transition-colors cursor-pointer">
                                                        <p className="text-xs font-medium text-foreground leading-snug">{n.text}</p>
                                                        <p className="text-[9px] text-muted-foreground mt-1.5 uppercase tracking-widest font-bold opacity-70">{n.time}</p>
                                                    </div>
                                                ))}`;

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

code = code.replace(oldMapStr, newMapStr);
fs.writeFileSync(file, code);
console.log('Fixed MOCK_NOTIFICATIONS error');
