const fs = require('fs');

// --- 1. UPDATE EXPLORE.TSX ---
let exploreCode = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const exploreBtn = `
                                                                <button
                                                                    className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 group/btn border active:scale-95 shadow-sm"
                                                                    style={{ background: "#2A2A2A", borderColor: "#444" }}
                                                                    onClick={() => handleRevokeSwap(swap.swapId)}
                                                                >
                                                                    {/* Mobile: Cancel Req */}
                                                                    <span className="md:hidden flex items-center gap-1 text-red-400"><X className="w-3.5 h-3.5" /> Cancel</span>
                                                                    
                                                                    {/* Desktop: Requested (Hover: Revoke) */}
                                                                    <span className="hidden md:flex md:group-hover/btn:hidden items-center gap-1.5 text-gray-300"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Requested</span>
                                                                    <span className="hidden md:group-hover/btn:flex items-center gap-1.5 text-red-400"><X className="w-4 h-4" /> Revoke</span>
                                                                </button>
`;

exploreCode = exploreCode.replace(
    /<button\s*className="flex-\[1\.5\] py-3\.5 rounded-xl text-\[12px\] font-bold transition-all flex items-center justify-center gap-2 group\/btn hover:bg-red-900"[\s\S]*?<\/button>/,
    exploreBtn.trim()
);
fs.writeFileSync('frontend-v2/src/pages/explore.tsx', exploreCode);


// --- 2. UPDATE PROGRESS.TSX ---
let progressCode = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

const progressBtn = `
                                                    <button onClick={() => handleRevokeSwap(req.id)} className="px-3 md:px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-1 md:gap-1.5 shadow-sm">
                                                        <X className="w-3 h-3 md:w-3.5 md:h-3.5" /> 
                                                        <span className="hidden sm:inline">Revoke</span>
                                                        <span className="sm:hidden">Cancel</span>
                                                    </button>
`;

progressCode = progressCode.replace(
    /<button onClick=\{\(\) => handleRevokeSwap\(req\.id\)\} className="px-3 py-1\.5 bg-red-900\/50 text-red-200 text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">\s*Revoke\s*<\/button>/,
    progressBtn.trim()
);
fs.writeFileSync('frontend-v2/src/pages/progress.tsx', progressCode);

console.log("Made Revoke buttons mobile-friendly and beautiful");
