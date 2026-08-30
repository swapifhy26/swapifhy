const fs = require('fs');

let chatPanel = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

// 1. Add states
if (!chatPanel.includes('const [swapStatus, setSwapStatus]')) {
    chatPanel = chatPanel.replace(
        'const [isDark, setIsDark] = useState(true);',
        'const [isDark, setIsDark] = useState(true);\n    const [swapStatus, setSwapStatus] = useState<string>("PENDING");\n    const [isProposer, setIsProposer] = useState<boolean>(false);'
    );
}

// 2. Update fetchData
const fetchDataBlock = `            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (data.partner) {
                setPartner(data.partner);
                setIsOnline(true); // dYs  TEMP: force online until heartbeat deploy is fixed
            }`;

const newFetchDataBlock = `            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (data.partner) {
                setPartner(data.partner);
                setIsOnline(true); // dYs  TEMP: force online until heartbeat deploy is fixed
            }
            if (data.status) setSwapStatus(data.status);
            if (data.isProposer !== undefined) setIsProposer(data.isProposer);`;

if (chatPanel.includes(fetchDataBlock)) {
    chatPanel = chatPanel.replace(fetchDataBlock, newFetchDataBlock);
}

// 3. Add handleAcceptSwap
if (!chatPanel.includes('const handleAcceptSwap')) {
    const revokeBlock = `    const revokeMessage = async (messageId: string) => {`;
    const handleAcceptSwap = `    const handleAcceptSwap = async () => {
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(\`\${API_URL}/api/mentorships/\${swapId}/accept\`, {
                method: "POST",
                headers: { "Authorization": \`Bearer \${token}\` }
            });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const revokeMessage = async (messageId: string) => {`;
    chatPanel = chatPanel.replace(revokeBlock, handleAcceptSwap);
}

// 4. Add the button to the header
const headerControls = `{/* Light / Dark toggle */}`;
const acceptButton = `                            {swapStatus === 'PENDING' && !isProposer && (
                                <button
                                    onClick={handleAcceptSwap}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(91,196,192,0.5)] transition-all flex items-center gap-2"
                                >
                                    <Check className="w-3.5 h-3.5" /> Start Swap
                                </button>
                            )}
                            {swapStatus === 'PENDING' && isProposer && (
                                <span className="px-3 py-1.5 bg-black/20 dark:bg-white/10 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Request Sent
                                </span>
                            )}
                            {swapStatus === 'ACCEPTED' && (
                                <span className="px-3 py-1.5 bg-teal-500/10 text-teal-500 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-teal-500/20">
                                    <CheckCircle className="w-3 h-3" /> Swap Active
                                </span>
                            )}

                            {/* Light / Dark toggle */}`;

if (chatPanel.includes(headerControls) && !chatPanel.includes('Start Swap</button>')) {
    chatPanel = chatPanel.replace(headerControls, acceptButton);
}

fs.writeFileSync('src/components/ChatPanel.tsx', chatPanel);
console.log('Successfully updated ChatPanel.tsx');
