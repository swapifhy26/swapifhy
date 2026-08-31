const fs = require('fs');

// --- 1. UPDATE CONTROLLER ---
let chatController = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const revokeSwapCode = `
export const revokeSwap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const swapId = req.params.swapId as string;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const swap = await prisma.swap.findUnique({ where: { id: swapId } });
        if (!swap || swap.proposerId !== userId || swap.status !== "PENDING") {
            res.status(400).json({ error: "Invalid swap request to revoke" });
            return;
        }

        // Delete the swap (cascade deletes messages)
        await prisma.swap.delete({ where: { id: swapId } });
        
        // Deduct the 50 XP they got for proposing
        await prisma.user.update({ where: { id: userId }, data: { xp: { decrement: 50 } } });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to revoke swap" });
    }
};
`;

chatController = chatController + '\n' + revokeSwapCode;
fs.writeFileSync('backend/src/controllers/chat.controller.ts', chatController);

// --- 2. UPDATE ROUTES ---
let chatRoutes = fs.readFileSync('backend/src/routes/chat.routes.ts', 'utf8');
chatRoutes = chatRoutes.replace(
    'heartbeat, getPresence \n} from',
    'heartbeat, getPresence, revokeSwap \n} from'
);
chatRoutes = chatRoutes.replace(
    "router.post('/presence', getPresence);",
    "router.post('/presence', getPresence);\nrouter.delete('/swap/:swapId', revokeSwap);"
);
fs.writeFileSync('backend/src/routes/chat.routes.ts', chatRoutes);

// --- 3. UPDATE FRONTEND EXPLORE.TSX ---
let exploreCode = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const handleRevokeCode = `
    const handleRevokeSwap = async (swapId: string) => {
        if (!confirm("Are you sure you want to revoke this swap request?")) return;
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/swap/\${swapId}\`, {
                method: "DELETE",
                headers: { "Authorization": \`Bearer \${token}\` }
            });
            if (res.ok) {
                // Refresh swaps to update button UI
                fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } })
                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });
            } else {
                const d = await res.json();
                alert(d.error || "Failed to revoke");
            }
        } catch (err) { console.error(err); }
    };
`;

exploreCode = exploreCode.replace(
    'const handleAcceptSwap = async',
    handleRevokeCode + '\n    const handleAcceptSwap = async'
);

const requestedBtnHTML = `
                                                            <button
                                                                className="flex-[1.5] py-3.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 group/btn hover:bg-red-900"
                                                                style={{ background: "#333", color: "#fff" }}
                                                                onClick={() => handleRevokeSwap(swap.swapId)}
                                                            >
                                                                <span className="group-hover/btn:hidden">Requested</span>
                                                                <span className="hidden group-hover/btn:block text-red-400">Revoke</span>
                                                            </button>
`;

exploreCode = exploreCode.replace(
    /<button\s+className="flex-\[1\.5\] py-3\.5 rounded-xl text-\[12px\] font-bold transition-all flex items-center justify-center gap-2 group\/btn opacity-50 cursor-not-allowed"\s+style=\{\{ background: "#333", color: "#fff" \}\}\s*>\s*Requested\s*<\/button>/g,
    requestedBtnHTML.trim()
);

// We should also replace the X icon in progress.tsx ? No, progress.tsx only shows INCOMING swaps, not outgoing.
// Wait, progress.tsx shows OUTGOING swaps in a separate div!
// Let's check progress.tsx to see if we can revoke from there too.

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', exploreCode);
console.log("Injected revoke feature");
