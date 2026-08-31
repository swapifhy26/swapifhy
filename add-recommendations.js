const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/matches.tsx', 'utf8');

// Add recommendations state
code = code.replace(
    'const [matches, setMatches] = useState<any[]>([]);',
    'const [matches, setMatches] = useState<any[]>([]);\n    const [recommendations, setRecommendations] = useState<any[]>([]);'
);

// Add the fetchAll to Promise.all
const fetchMatchesRegex = /const fetchMatches = fetch\(\`\$\{API_URL\}\/api\/match\/sync-matrix\`[\s\S]*?Promise\.all\(\[fetchMatches, fetchConvs, fetchProfile\]\)\n\s*\.then\(\(\[matchData, chatData, profData\]\) => \{/m;

const replacementFetchMatches = `const fetchMatches = fetch(\`\${API_URL}/api/match/sync-matrix\`, { headers: { "Authorization": \`Bearer \${token}\` } }).then(res => res.json());
        const fetchConvs = fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } }).then(res => res.json());
        const fetchProfile = fetch(\`\${API_URL}/api/user/profile\`, { headers: { "Authorization": \`Bearer \${token}\` } }).then(res => res.json());
        const fetchAll = fetch(\`\${API_URL}/api/match/all\`, { headers: { "Authorization": \`Bearer \${token}\` } }).then(res => res.json());

        Promise.all([fetchMatches, fetchConvs, fetchProfile, fetchAll])
            .then(([matchData, chatData, profData, allData]) => {
                if (allData.matches) setRecommendations(allData.matches);`;

code = code.replace(fetchMatchesRegex, replacementFetchMatches);

// Add useMemo calculation for categorizedRecommendations
const useMemoRegex = /const handleFollow = async/;
const categorizedRecsCode = `
    const categorizedRecommendations = React.useMemo(() => {
        const categories = {
            "AI & Machine Learning": ["ai", "machine", "deep", "nlp", "neural"],
            "Computer Science & Systems": ["c++", "c", "java", "rust", "go", "algorithm", "cs", "computer science", "system"],
            "Web & UI Design": ["ui", "ux", "figma", "react", "next", "frontend", "html", "css", "web", "design"],
            "Data & Backend": ["sql", "python", "backend", "node", "database", "data", "django", "spring"]
        };
        
        const groups: Record<string, any[]> = {
            "AI & Machine Learning": [],
            "Computer Science & Systems": [],
            "Web & UI Design": [],
            "Data & Backend": [],
            "Other Top Swappers": []
        };

        recommendations.forEach(user => {
            if (user.id === currentUserId) return;
            const skills = [...(user.teaching || []), ...(user.teachingCategories || [])].map((s: string) => s.toLowerCase());
            
            let placed = false;
            for (const [cat, keywords] of Object.entries(categories)) {
                if (skills.some(s => keywords.some(k => s.includes(k)))) {
                    groups[cat].push(user);
                    placed = true;
                    break;
                }
            }
            if (!placed) groups["Other Top Swappers"].push(user);
        });

        for (const key in groups) {
            groups[key].sort((a, b) => ((b.reputation || 0) + (b.teaching?.length || 0)) - ((a.reputation || 0) + (a.teaching?.length || 0)));
            groups[key] = groups[key].slice(0, 5);
        }

        return Object.entries(groups).filter(([_, users]) => users.length > 0);
    }, [recommendations, currentUserId]);

    const handleFollow = async`;

code = code.replace(useMemoRegex, categorizedRecsCode);

// Add the UI
const noMatchesRegex = /<\/div>\s*\) : \(\s*<div className="py-20 text-center opacity-20"><p className="text-xs font-black uppercase tracking-\[0\.5em\]">No matches found in your area\.<\/p><\/div>\s*\)\s*\}/m;

const replacementUI = `</div>
                        ) : (
                            <div className="py-20 text-center opacity-20"><p className="text-xs font-black uppercase tracking-[0.5em]">No matches found in your area.</p></div>
                        )}

                        {/* OUR RECOMMENDATIONS SECTION */}
                        {recommendations.length > 0 && (
                            <div className="mt-20 pt-10 border-t border-border/30">
                                <h3 className="text-2xl font-heading font-black mb-1">Our Recommendations</h3>
                                <p className="text-muted-foreground text-xs mb-8">Top rated swappers across different categories to help you grow.</p>
                                
                                <div className="space-y-12">
                                    {categorizedRecommendations.map(([category, users]) => (
                                        <div key={category}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                                <h4 className="text-sm font-black uppercase tracking-widest text-primary">{category}</h4>
                                                <div className="h-[1px] flex-1 bg-border/40 ml-4"></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {users.map((user: any, idx: number) => (
                                                    <div key={idx} className="p-4 rounded-2xl bg-surface/30 border border-border/50 hover:bg-surface hover:border-primary/30 transition-all flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-lg text-primary overflow-hidden">
                                                                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/> : (user.name?.charAt(0) || "U")}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-bold truncate">{user.name}</h5>
                                                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 opacity-70">
                                                                    {user.teaching?.slice(0, 3).join(", ") || "No specific skills listed"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleSync(user.id); }} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-background transition-all">
                                                            <Zap className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}`;

code = code.replace(noMatchesRegex, replacementUI);

fs.writeFileSync('frontend-v2/src/pages/matches.tsx', code);
console.log("Injected recommendations into matches.tsx (Fixed)");
