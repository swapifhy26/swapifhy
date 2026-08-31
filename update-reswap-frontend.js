const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const regex = /if \(swap && swap\.status === 'ACCEPTED'\) \{[\s\S]*?return \([\s\S]*?<button[\s\S]*?Message[\s\S]*?<\/button>[\s\S]*?\);[\s\S]*?\}/;

const replacement = `if (swap && (swap.status === 'ACCEPTED' || swap.status === 'COMPLETED')) {
                                                        return (
                                                            <div className="flex gap-2 flex-[1.5]">
                                                                <button
                                                                    className="flex-1 py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1 group/btn hover:scale-[1.02] shadow-sm border"
                                                                    style={{ background: "#2A2A2A", color: "#fff", borderColor: "#444" }}
                                                                    onClick={(e) => { e.stopPropagation(); setActiveSwapId(swap.swapId); }}
                                                                >
                                                                    Message
                                                                    <MessageSquare className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                                                </button>
                                                                <button
                                                                    className="flex-1 py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1 group/btn hover:scale-[1.02] shadow-lg"
                                                                    style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff", boxShadow: "0 4px 20px rgba(91,196,192,0.25)" }}
                                                                    onClick={(e) => { e.stopPropagation(); handleSync(m.id); }}
                                                                >
                                                                    Start Swap
                                                                    <Zap className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                                </button>
                                                            </div>
                                                        );
                                                    }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
    console.log("Updated explore.tsx to render BOTH Message and Start Swap buttons");
} else {
    console.log("Could not find regex match in explore.tsx");
}
