const fs = require('fs');

let code = fs.readFileSync('src/pages/explore.tsx', 'utf8');

// 1. Add mySwaps to state if missing
if (!code.includes('const [mySwaps, setMySwaps] = useState<any[]>([])')) {
    code = code.replace(
        /const \[myLearning, setMyLearning\] = useState<string\[\]>\(\[\]\);/g,
        'const [myLearning, setMyLearning] = useState<string[]>([]);\n    const [mySwaps, setMySwaps] = useState<any[]>([]);'
    );
}

// 2. Fetch conversations
const fetchMatchAllRegex = /fetch\(`\$\{API_URL\}\/api\/match\/all`[\s\S]*?\.catch\(\(\) => setLoading\(false\)\);/;
const newFetchBlock = `fetch(\`\${API_URL}/api/match/all\`, {
            headers: { "Authorization": \`Bearer \${token}\` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches(data.matches);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetch(\`\${API_URL}/api/chat/conversations\`, {
            headers: { "Authorization": \`Bearer \${token}\` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.conversations) setMySwaps(data.conversations);
            })
            .catch(() => {});`;

if (!code.includes('/api/chat/conversations')) {
    code = code.replace(fetchMatchAllRegex, newFetchBlock);
}

// 3. Update handleSync to refresh swaps, and add handleAcceptSwap
const handleSyncRegex = /const handleSync = async \(receiverId: string\) => \{[\s\S]*?setActiveSwapId\(data\.swapId\);\s*\} catch \(err\) \{ console\.error\(err\); \}\s*\};/;
const newHandleSyncBlock = `const handleSync = async (receiverId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/sync\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (data.swapId) {
                // Refresh swaps to update button UI
                fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } })
                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });
            }
        } catch (err) { console.error(err); }
    };

    const handleAcceptSwap = async (swapId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(\`\${API_URL}/api/mentorships/\${swapId}/accept\`, {
                method: "POST",
                headers: { "Authorization": \`Bearer \${token}\` }
            });
            // Refresh swaps to update button UI
            fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } })
                .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });
        } catch (err) { console.error(err); }
    };`;

if (!code.includes('handleAcceptSwap')) {
    code = code.replace(handleSyncRegex, newHandleSyncBlock);
}

// 4. Update the Message button using regex to avoid whitespace issues
const buttonRegex = /\{\/\*.*Message button.*always visible, themed colour.*\*\/\}[\s\S]*?<button[\s\S]*?onClick=\{\(\) => handleSync\(m\.id\)\}[\s\S]*?>[\s\S]*?Message[\s\S]*?<MessageSquare[\s\S]*?<\/button>/i;

const newButtonBlock = `{(() => {
                                                    const swap = mySwaps.find(s => s.partnerId === m.id);
                                                    
                                                    if (swap && swap.status === 'ACCEPTED') {
                                                        return (
                                                            <button
                                                                className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:scale-[1.02] shadow-lg"
                                                                style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff", boxShadow: "0 4px 20px rgba(91,196,192,0.25)" }}
                                                                onClick={() => setActiveSwapId(swap.swapId)}
                                                            >
                                                                Message
                                                                <MessageSquare className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                            </button>
                                                        );
                                                    }
                                                    
                                                    if (swap && swap.status === 'PENDING') {
                                                        if (swap.isProposer) {
                                                            return (
                                                                <button
                                                                    className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn opacity-50 cursor-not-allowed"
                                                                    style={{ background: "#333", color: "#fff" }}
                                                                >
                                                                    Requested
                                                                </button>
                                                            );
                                                        } else {
                                                            return (
                                                                <button
                                                                    className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:scale-[1.02] shadow-lg"
                                                                    style={{ background: "#F07060", color: "#fff", boxShadow: "0 4px 20px rgba(240,112,96,0.25)" }}
                                                                    onClick={() => handleAcceptSwap(swap.swapId)}
                                                                >
                                                                    Accept Swap
                                                                </button>
                                                            );
                                                        }
                                                    }

                                                    // Default: Start a Swap
                                                    return (
                                                        <button
                                                            className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:scale-[1.02] shadow-lg"
                                                            style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff", boxShadow: "0 4px 20px rgba(91,196,192,0.25)" }}
                                                            onClick={() => handleSync(m.id)}
                                                        >
                                                            Start a Swap
                                                            <Zap className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    );
                                                })()}`;

if (buttonRegex.test(code)) {
    code = code.replace(buttonRegex, newButtonBlock);
    fs.writeFileSync('src/pages/explore.tsx', code);
    console.log('Successfully regex-replaced button block in explore.tsx');
} else {
    console.log('Could not find the button block with Regex');
}
