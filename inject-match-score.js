const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const calcMatchScoreFunc = `
    const calculateMatchScore = (m: any) => {
        const theirTeaching = (m.teaching || []).map((s: string) => s.toLowerCase());
        const theirLearning = (m.learning || []).map((s: string) => s.toLowerCase());
        
        let overlapTeach = myLearning.filter(s => theirTeaching.includes(s)).length;
        let overlapLearn = myTeaching.filter(s => theirLearning.includes(s)).length;
        const totalOverlap = overlapTeach + overlapLearn;
        
        // Deterministic base score based on ID string
        let hash = 0;
        for (let i = 0; i < m.id.length; i++) {
            hash += m.id.charCodeAt(i);
        }
        
        const baseScore = 60 + (hash % 20); // 60-79
        
        let finalScore = baseScore;
        if (totalOverlap === 1) finalScore = 85 + (hash % 10); // 85-94
        if (totalOverlap >= 2) finalScore = 95 + (hash % 5);   // 95-99
        
        return finalScore;
    };
`;

code = code.replace(
    'const isSkillMatch = (m: any): boolean => {',
    calcMatchScoreFunc + '\n    const isSkillMatch = (m: any): boolean => {'
);

const oldBadge = `{matched && (
                                                <div className="absolute top-6 right-6 z-20">
                                                    <div className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
                                                        style={{
                                                            background: "linear-gradient(135deg, rgba(91,196,192,0.15), rgba(107,143,212,0.15))",
                                                            border: "1px solid rgba(91,196,192,0.4)",
                                                            color: "#5BC4C0",
                                                            backdropFilter: "blur(8px)"
                                                        }}>
                                                        <Zap className="w-3.5 h-3.5" /> Skill Match
                                                    </div>
                                                </div>
                                            )}`;

const newBadge = `
                                            {/* 🔥 Match Compatibility Score Pill */}
                                            {(() => {
                                                const matchScore = calculateMatchScore(m);
                                                const isHighMatch = matchScore >= 85;
                                                return (
                                                    <div className="absolute top-6 right-6 z-20">
                                                        <div className={\`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl \${isHighMatch ? 'animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''}\`}
                                                            style={{
                                                                background: isHighMatch ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                                                                border: \`1px solid \${isHighMatch ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}\`,
                                                                color: isHighMatch ? "#22C55E" : "#888",
                                                                backdropFilter: "blur(8px)"
                                                            }}>
                                                            {isHighMatch ? "🔥" : "💡"} {matchScore}% Match
                                                        </div>
                                                    </div>
                                                );
                                            })()}
`;

// Note: The spaces/indentation might not match perfectly for replacement. Let's use a robust replace logic.
// The old badge has: `{matched && (\n                                                <div className="absolute top-6 right-6 z-20">`
const regex = /\{\s*matched && \(\s*<div className="absolute top-6 right-6 z-20">[\s\S]*?<\/div>\s*\)\}/;

code = code.replace(regex, newBadge);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Injected match score into explore.tsx");
