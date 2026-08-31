const fs = require('fs');

let exploreCode = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

// Add xpToast state
exploreCode = exploreCode.replace(
    'const [filterDomain, setFilterDomain] = useState("all");',
    'const [filterDomain, setFilterDomain] = useState("all");\n    const [xpToast, setXpToast] = useState<{show: boolean, amount: number, text: string}>({show: false, amount: 0, text: ""});'
);

// Show XP Toast on handleSync
exploreCode = exploreCode.replace(
    'if (data.swapId) {\n                // Refresh swaps to update button UI\n                fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } })\n                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });\n            }',
    'if (data.swapId) {\n                // Refresh swaps to update button UI\n                fetch(`${API_URL}/api/chat/conversations`, { headers: { "Authorization": `Bearer ${token}` } })\n                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });\n                setXpToast({ show: true, amount: 50, text: "Swap Requested!" });\n                setTimeout(() => setXpToast(s => ({ ...s, show: false })), 3000);\n            }'
);

// Inject Toast UI at the bottom of Explore
const toastUI = `
            {/* XP TOAST ANIMATION */}
            <AnimatePresence>
                {xpToast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
                    >
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 py-3 rounded-full font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-3 border-2 border-white/20">
                            <Zap className="w-6 h-6 animate-pulse" />
                            <div className="flex flex-col -gap-1">
                                <span className="leading-none text-xl">+{xpToast.amount} XP</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-80 leading-none">{xpToast.text}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
`;

exploreCode = exploreCode.replace(
    '</AnimatePresence>\n            </div>\n        </>\n    );\n}',
    toastUI + '\n            </AnimatePresence>\n            </div>\n        </>\n    );\n}'
);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', exploreCode);
console.log("Injected XP Toast into Explore");
