const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/onboarding.tsx', 'utf8');

// 1. Add selectedSkills state
code = code.replace(
    'const [requestingSwap, setRequestingSwap] = useState(false);',
    'const [requestingSwap, setRequestingSwap] = useState(false);\n    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);'
);

// 2. Modify handleMagicSwap to use selectedSkills
code = code.replace(
    /body: JSON\.stringify\(\{ receiverId: magicMatch\.id \}\)/,
    'body: JSON.stringify({ receiverId: magicMatch.id, skillsToLearn: selectedSkills })'
);

// 3. Update the "They Can Teach You" section to be clickable
const newSkillsJSX = `
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-teal-400 mb-2 block tracking-widest">Select what to learn:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {magicMatch.teachSkills?.map((s: string) => {
                                        const isSelected = selectedSkills.includes(s);
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedSkills(prev => prev.filter(skill => skill !== s));
                                                    } else {
                                                        setSelectedSkills(prev => [...prev, s]);
                                                    }
                                                }}
                                                className={\`text-xs px-2 py-1.5 rounded-md border transition-all flex items-center gap-1 \${isSelected ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-white/5 text-white/90 border-white/10 hover:border-white/30'}\`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
`;

code = code.replace(
    /<div className="bg-black\/20 rounded-xl p-3 border border-white\/5">\s*<span className="text-\[10px\] uppercase font-bold text-teal-400 mb-1 block tracking-widest">They Can Teach You<\/span>[\s\S]*?<\/div>\s*<\/div>/,
    newSkillsJSX
);

// 4. Disable the button if no skills are selected
code = code.replace(
    'disabled={requestingSwap}',
    'disabled={requestingSwap || selectedSkills.length === 0}'
);

fs.writeFileSync('frontend-v2/src/pages/onboarding.tsx', code);
console.log("Updated onboarding.tsx with interactive skill selection");
