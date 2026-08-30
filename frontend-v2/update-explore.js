const fs = require('fs');

let code = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');
// wait, I need to update frontend-v2/src/pages/explore.tsx
code = fs.readFileSync('src/pages/explore.tsx', 'utf8');

// 1. Add mySwaps to state
if (!code.includes('const [mySwaps, setMySwaps] = useState<any[]>([])')) {
    code = code.replace(
        'const [myLearning, setMyLearning] = useState<string[]>([]);',
        'const [myLearning, setMyLearning] = useState<string[]>([]);\n    const [mySwaps, setMySwaps] = useState<any[]>([]);'
    );
}

// 2. Fetch conversations
const fetchBlock = `        fetch(\`\${API_URL}/api/match/all\`, {
            headers: { "Authorization": \`Bearer \${token}\` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches(data.matches);
                setLoading(false);
            })
            .catch(() => setLoading(false));`;

const newFetchBlock = `        fetch(\`\${API_URL}/api/match/all\`, {
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

if (code.includes(fetchBlock)) {
    code = code.replace(fetchBlock, newFetchBlock);
}

// 3. Update the handleSync to refresh swaps, and add handleAcceptSwap
const handleSyncBlock = `    const handleSync = async (receiverId: string) => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/sync\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (data.swapId) setActiveSwapId(data.swapId);
        } catch (err) { console.error(err); }
    };`;

const newHandleSyncBlock = `    const handleSync = async (receiverId: string) => {
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

if (code.includes(handleSyncBlock)) {
    code = code.replace(handleSyncBlock, newHandleSyncBlock);
}

// 4. Update the Message button
const buttonBlock = `{/* o. Message button ?" always visible, themed colour */}
                                                <button
                                                    className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:scale-[1.02] shadow-lg"
                                                    style={{
                                                        background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)",
                                                        color: "#fff",
                                                        boxShadow: "0 4px 20px rgba(91,196,192,0.25)"
                                                    }}
                                                    onClick={() => handleSync(m.id)}
                                                >
                                                    Message
                                                    <MessageSquare className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>`;

const newButtonBlock = `                                                {(() => {
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

if (code.includes('Message\n                                                    <MessageSquare')) {
    code = code.replace(buttonBlock, newButtonBlock);
    fs.writeFileSync('src/pages/explore.tsx', code);
    console.log('Successfully updated explore.tsx');
} else {
    console.log('Could not find the button block to replace');
}
