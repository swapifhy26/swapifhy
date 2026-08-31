const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const newBadge = `
                                            {/* 🔥 Match Compatibility Score Pill */}
                                            {(() => {
                                                const matchScore = calculateMatchScore(m);
                                                const isHighMatch = matchScore >= 85;
                                                
                                                // High Match Styling (Fire)
                                                const highStyle = {
                                                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                                                    color: "#fff",
                                                    boxShadow: "0 4px 20px rgba(255,107,107,0.4)",
                                                    border: "1px solid rgba(255,255,255,0.2)"
                                                };
                                                
                                                // Good Match Styling (Sparkle)
                                                const goodStyle = {
                                                    background: "linear-gradient(135deg, #6B8FD4, #5BC4C0)",
                                                    color: "#fff",
                                                    boxShadow: "0 4px 15px rgba(107,143,212,0.3)",
                                                    border: "1px solid rgba(255,255,255,0.2)"
                                                };

                                                return (
                                                    <div className="absolute top-6 right-6 z-20">
                                                        <div className={\`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-transform duration-300 hover:scale-105 \${isHighMatch ? 'animate-pulse' : ''}\`}
                                                            style={isHighMatch ? highStyle : goodStyle}>
                                                            {isHighMatch ? "🔥" : "✨"} {matchScore}% Match
                                                        </div>
                                                    </div>
                                                );
                                            })()}
`;

// Replace the previous Match Compatibility Score Pill
const regex = /\{\/\* 🔥 Match Compatibility Score Pill \*\/\}[\s\S]*?\}\(\)\)\}/;
code = code.replace(regex, newBadge.trim());

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Updated match score badge to be very attractive");
