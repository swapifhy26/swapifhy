const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

// Add states
code = code.replace(
    'const [activeSwapId, setActiveSwapId] = useState<string | null>(null);',
    `const [activeSwapId, setActiveSwapId] = useState<string | null>(null);\n    const [syncTarget, setSyncTarget] = useState<any>(null);\n    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);\n    const [syncing, setSyncing] = useState(false);`
);

// Replace handleSync definition
const newHandleSync = `
    const handleSync = async () => {
        if (!syncTarget) return;
        if (selectedSkills.length === 0) {
            alert("Please select at least one skill to learn.");
            return;
        }
        setSyncing(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/sync\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ receiverId: syncTarget.id, skillsToLearn: selectedSkills })
            });
            const data = await res.json();
            if (data.swapId) {
                fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } })
                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });
                setXpToast({ show: true, amount: 50, text: "Swap Requested!" });
                setTimeout(() => setXpToast(s => ({ ...s, show: false })), 3000);
            }
        } catch (err) { console.error(err); }
        setSyncTarget(null);
        setSelectedSkills([]);
        setSyncing(false);
    };

    const initiateSyncPrompt = (user: any) => {
        setSyncTarget(user);
        setSelectedSkills([]);
    };
`;
code = code.replace(
    /const handleSync = async \([\s\S]*?\} catch \(err\) \{ console\.error\(err\); \}\n    \};/,
    newHandleSync
);

// Change onClick to initiateSyncPrompt(m)
code = code.replace(
    /onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleSync\(m\.id\); \}\}/g,
    'onClick={(e) => { e.stopPropagation(); initiateSyncPrompt(m); }}'
);
code = code.replace(
    /onClick=\{\(\) => handleSync\(m\.id\)\}/g,
    'onClick={(e) => { e.stopPropagation(); initiateSyncPrompt(m); }}'
);

// Add modal JSX at the end of the return
const modalJSX = `
            {/* Skill Selection Modal */}
            <AnimatePresence>
                {syncTarget && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <button onClick={() => setSyncTarget(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-heading font-black text-foreground mb-1">Select Skills</h3>
                                <p className="text-sm text-muted-foreground">What would you like to learn from {syncTarget.name}?</p>
                            </div>
                            
                            <div className="space-y-3 mb-8">
                                {syncTarget.teachSkills?.length > 0 ? (
                                    syncTarget.teachSkills.map((skill: string) => {
                                        const isSelected = selectedSkills.includes(skill);
                                        return (
                                            <button
                                                key={skill}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedSkills(prev => prev.filter(s => s !== skill));
                                                    } else {
                                                        setSelectedSkills(prev => [...prev, skill]);
                                                    }
                                                }}
                                                className={\`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between \${isSelected ? 'border-primary bg-primary/10' : 'border-border/50 bg-surface/30 hover:border-primary/50'}\`}
                                            >
                                                <span className={\`font-bold \${isSelected ? 'text-primary' : 'text-foreground'}\`}>{skill}</span>
                                                <div className={\`w-5 h-5 rounded-md border flex items-center justify-center \${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}\`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center italic">This user hasn't listed any teaching skills yet.</p>
                                )}
                            </div>
                            
                            <button
                                onClick={handleSync}
                                disabled={selectedSkills.length === 0 || syncing}
                                className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff" }}
                            >
                                {syncing ? "Sending..." : <>Send Request <Zap className="w-4 h-4" /></>}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
`;

code = code.replace(
    /\s*<\/div>\s*\);\s*\}\s*$/m,
    modalJSX + '\n}'
);

// Make sure Check is imported from lucide-react
if (!code.includes('Check,')) {
    code = code.replace(
        /import \{ X, Zap, /,
        'import { X, Zap, Check, '
    );
}

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Updated explore.tsx to include Skill Selection Modal");
