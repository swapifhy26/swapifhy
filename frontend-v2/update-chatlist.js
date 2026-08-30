const fs = require('fs');
let code = fs.readFileSync('src/components/ChatListPanel.tsx', 'utf8');

if (!code.includes('unreadCount?: number;')) {
    code = code.replace(/isProposer: boolean;/, 'isProposer: boolean;\n    unreadCount?: number;');
}

const targetStr = `<Clock className="w-2.5 h-2.5" />
                                                    {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>`;
const newStr = `<Clock className="w-2.5 h-2.5" />
                                                    {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                                {conv.unreadCount ? (
                                                    <span className="flex items-center justify-center bg-primary text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1 shrink-0 shadow-[0_0_8px_rgba(75,100,250,0.5)] ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                ) : null}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/components/ChatListPanel.tsx', code);
    console.log('Added unread badge to ChatListPanel');
} else {
    console.log('Could not find target string in ChatListPanel');
}
