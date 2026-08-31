const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const regex = /<span className="text-foreground italic">Swapifhy Hub<\/span>\.\s*<\/p>/;

const trendingTags = `</p>
                    {/* Trending Skills Tags */}
                    {!loading && (
                        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border/50 max-w-3xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mr-2 flex items-center gap-1">
                                <span dangerouslySetInnerHTML={{ __html: '&#x1F525;' }} /> Trending
                            </span>
                            {["UI/UX", "AI", "Spanish", "Next.js", "Figma", "Marketing"].map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className={\`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm border \${searchQuery.toLowerCase() === tag.toLowerCase() ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-primary/5 text-foreground/80 border-primary/10 hover:bg-primary/20 hover:border-primary/30'}\`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}`;

code = code.replace(regex, `<span className="text-foreground italic">Swapifhy Hub</span>.\n                    ${trendingTags}`);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Injected Trending Skills tags via regex");
