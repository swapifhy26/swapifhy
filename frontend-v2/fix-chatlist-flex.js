const fs = require('fs');
let code = fs.readFileSync('src/components/ChatListPanel.tsx', 'utf8');

const faulty = `<span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter flex items-center gap-1.5 shrink-0 ml-2">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                                {conv.unreadCount ? (
                                                    <span className="flex items-center justify-center bg-primary text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1 shrink-0 shadow-[0_0_8px_rgba(75,100,250,0.5)] ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                ) : null}`;

const fixed = `<div className="flex items-center shrink-0">
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter flex items-center gap-1.5 ml-2">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {conv.unreadCount ? (
                                                        <span className="flex items-center justify-center bg-primary text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1 shadow-[0_0_8px_rgba(75,100,250,0.5)] ml-2">
                                                            {conv.unreadCount}
                                                        </span>
                                                    ) : null}
                                                </div>`;

if (code.includes(faulty)) {
    code = code.replace(faulty, fixed);
    fs.writeFileSync('src/components/ChatListPanel.tsx', code);
    console.log("Fixed flex wrapper in ChatListPanel");
} else {
    console.log("Could not find faulty string");
}
