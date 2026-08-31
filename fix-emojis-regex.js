const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const regex = /return \(\s*<div className="absolute top-6 right-6 z-20">[\s\S]*?<\/div>\s*\);\s*\}\)\(\)\}/;

const replacement = `return (
                                                    <div className="absolute top-6 right-6 z-20">
                                                        <div className={\`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-transform duration-300 hover:scale-105 \${isHighMatch ? 'animate-pulse' : ''}\`}
                                                            style={isHighMatch ? highStyle : goodStyle}>
                                                            <span dangerouslySetInnerHTML={{ __html: isHighMatch ? '&#x1F525;' : '&#x2728;' }} /> {matchScore}% Match
                                                        </div>
                                                    </div>
                                                );
                                            })()}`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Successfully replaced the return statement and fixed emojis via HTML entities.");
