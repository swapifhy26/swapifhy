const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const regex = /\{\/\* Actions \*\/\}\s*<div className="flex gap-3 mt-10">[\s\S]*?<\/div>\s*<\/div>\s*<\/GlowCard>/;

const replacement = `{/* Actions */}
                                            {(() => {
                                                const swap = mySwaps.find(s => s.partnerId === m.id);
                                                const hasThreeButtons = swap && (swap.status === 'ACCEPTED' || swap.status === 'COMPLETED');
                                                
                                                return (
                                                    <div className={\`grid gap-2 mt-auto pt-8 \${hasThreeButtons ? 'grid-cols-3' : 'grid-cols-2'}\`}>
                                                        <button
                                                            className="w-full py-2.5 sm:py-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground text-[11px] sm:text-[12px] font-semibold hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-1.5 h-full"
                                                            onClick={() => handleFollow(m.id, m.isFollowing)}
                                                        >
                                                            {m.isFollowing
                                                                ? <><span>Following</span><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" /></>
                                                                : "Follow"
                                                            }
                                                        </button>

                                                        {hasThreeButtons ? (
                                                            <>
                                                                <button
                                                                    className="w-full py-2.5 sm:py-3.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 group/btn hover:scale-[1.02] shadow-sm border h-full"
                                                                    style={{ background: "#2A2A2A", color: "#fff", borderColor: "#444" }}
                                                                    onClick={(e) => { e.stopPropagation(); setActiveSwapId(swap.swapId); }}
                                                                >
                                                                    Message
                                                                    <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:scale-110 transition-transform opacity-90" />
                                                                </button>
                                                                <button
                                                                    className="w-full py-2 sm:py-3.5 rounded-xl text-[10px] sm:text-[12px] font-bold transition-all flex items-center justify-between px-2 sm:px-3 group/btn hover:scale-[1.02] shadow-lg h-full leading-tight text-left"
                                                                    style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff", boxShadow: "0 4px 20px rgba(91,196,192,0.25)" }}
                                                                    onClick={(e) => { e.stopPropagation(); handleSync(m.id); }}
                                                                >
                                                                    <span>Start<br/>Swap</span>
                                                                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform shrink-0" />
                                                                </button>
                                                            </>
                                                        ) : swap && swap.status === 'PENDING' ? (
                                                            swap.isProposer ? (
                                                                <button
                                                                    className="w-full py-2.5 sm:py-3.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 group/btn border active:scale-95 shadow-sm h-full"
                                                                    style={{ background: "#2A2A2A", borderColor: "#444" }}
                                                                    onClick={() => handleRevokeSwap(swap.swapId)}
                                                                >
                                                                    <span className="md:hidden flex items-center gap-1 text-red-400"><X className="w-3 h-3" /> Cancel</span>
                                                                    <span className="hidden md:flex md:group-hover/btn:hidden items-center gap-1 text-gray-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Requested</span>
                                                                    <span className="hidden md:group-hover/btn:flex items-center gap-1 text-red-400"><X className="w-3.5 h-3.5" /> Revoke</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="w-full py-2.5 sm:py-3.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 group/btn hover:scale-[1.02] shadow-lg h-full"
                                                                    style={{ background: "#F07060", color: "#fff", boxShadow: "0 4px 20px rgba(240,112,96,0.25)" }}
                                                                    onClick={() => handleAcceptSwap(swap.swapId)}
                                                                >
                                                                    Accept Swap
                                                                </button>
                                                            )
                                                        ) : (
                                                            <button
                                                                className="w-full py-2.5 sm:py-3.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 group/btn hover:scale-[1.02] shadow-lg h-full"
                                                                style={{ background: "linear-gradient(135deg, #5BC4C0, #6B8FD4)", color: "#fff", boxShadow: "0 4px 20px rgba(91,196,192,0.25)" }}
                                                                onClick={() => handleSync(m.id)}
                                                            >
                                                                Start a Swap
                                                                <Zap className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </GlowCard>`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
    console.log("Updated explore.tsx button grid layout");
} else {
    console.log("Could not find regex match in explore.tsx");
}
