const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/onboarding.tsx', 'utf8');

// Add states
code = code.replace(
    'const [error, setError] = useState("");',
    `const [error, setError] = useState("");\n    const [magicMatch, setMagicMatch] = useState<any>(null);\n    const [showMagicMatch, setShowMagicMatch] = useState(false);\n    const [requestingSwap, setRequestingSwap] = useState(false);`
);

// Add Zap icon
code = code.replace(
    'import { X, ArrowRight, Sparkles } from "lucide-react";',
    'import { X, ArrowRight, Sparkles, Zap, MessageSquare } from "lucide-react";'
);

// Rewrite handleSubmit
const handleMatchReplace = `
            if (res.ok) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
                });
                setCompleted(true);
                
                // Fetch first match while confetti plays
                let foundMatch = null;
                fetch(\`\${API_URL}/api/match/all\`, { headers: { Authorization: \`Bearer \${token}\` } })
                    .then(r => r.json())
                    .then(data => {
                        if (data.users && data.users.length > 0) {
                            foundMatch = data.users[0];
                            setMagicMatch(foundMatch);
                        }
                    })
                    .catch(() => {});

                setTimeout(() => {
                    if (foundMatch) {
                        setShowMagicMatch(true);
                    } else {
                        router.push("/feed");
                    }
                }, 3500);
`;

code = code.replace(
    /if \(res\.ok\) \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?router\.push\("\/feed"\);[\s\S]*?\}, 3500\);/m,
    handleMatchReplace
);

// Add handleMagicSwap
const handleMagicSwapStr = `
    const handleMagicSwap = async () => {
        if (!magicMatch) return;
        setRequestingSwap(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(\`\${API_URL}/api/chat/sync\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ receiverId: magicMatch.id })
            });
            // We can just redirect them to their matches/chat so they see it!
            router.push("/matches");
        } catch (err) {
            router.push("/feed");
        }
    };
`;
code = code.replace(
    'const handleSubmit = async () => {',
    handleMagicSwapStr + '\n\n    const handleSubmit = async () => {'
);


// Rewrite the render to intercept showMagicMatch
const magicMatchRenderStr = `
    if (showMagicMatch && magicMatch) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-heading font-black text-white tracking-tight mb-2">
                            Perfect Match
                        </h1>
                        <p className="text-white/60 text-sm">We found someone who perfectly aligns with your skills!</p>
                    </div>

                    <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-bl-xl text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                            {Math.round(magicMatch.score)}% Match
                        </div>
                        
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent p-0.5 mb-4 shadow-lg">
                            {magicMatch.avatarUrl ? (
                                <img src={magicMatch.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-surface border-2 border-background flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{magicMatch.name?.charAt(0) || "U"}</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{magicMatch.name}</h2>
                        
                        <div className="flex flex-col gap-3 mt-6 text-left">
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-teal-400 mb-1 block tracking-widest">They Can Teach You</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {magicMatch.teachSkills?.slice(0, 3).map((s: string) => (
                                        <span key={s} className="text-xs bg-white/5 text-white/90 px-2 py-1 rounded-md border border-white/10">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-rose-400 mb-1 block tracking-widest">They Want To Learn</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {magicMatch.learnSkills?.slice(0, 3).map((s: string) => (
                                        <span key={s} className="text-xs bg-white/5 text-white/90 px-2 py-1 rounded-md border border-white/10">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleMagicSwap}
                            disabled={requestingSwap}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff" }}
                        >
                            {requestingSwap ? "Sending..." : <>Send Swap Request <Zap className="w-4 h-4" /></>}
                        </button>
                        <button
                            onClick={() => router.push("/feed")}
                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Skip to Feed
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (completed) {
`;

code = code.replace(
    'if (completed) {',
    magicMatchRenderStr
);

fs.writeFileSync('frontend-v2/src/pages/onboarding.tsx', code);
console.log("Updated onboarding to include Magic First Match!");
