const fs = require('fs');
let code = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

const streakLogic = `
const streakCache = new Map<string, string>(); // userId -> "YYYY-MM-DD"

export const heartbeat = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    
    onlineUsers.set(userId, Date.now());

    // --- DUOLINGO STREAK LOGIC (HEARTBEAT BASED) ---
    try {
        const todayStr = new Date().toISOString().split('T')[0]; // UTC YYYY-MM-DD
        const lastUpdated = streakCache.get(userId);
        
        // If we haven't checked their streak today in this server instance
        if (lastUpdated !== todayStr) {
            const user = await prisma.user.findUnique({ 
                where: { id: userId }, 
                select: { currentStreak: true, highestStreak: true, lastStreakDate: true }
            });
            
            if (user) {
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                
                let newStreak = user.currentStreak;
                let highest = user.highestStreak;
                let shouldUpdate = false;

                if (!user.lastStreakDate) {
                    newStreak = 1;
                    highest = Math.max(highest, 1);
                    shouldUpdate = true;
                } else {
                    const lastDate = new Date(user.lastStreakDate);
                    lastDate.setUTCHours(0, 0, 0, 0);
                    
                    const diffTime = today.getTime() - lastDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) { // They were active yesterday
                        newStreak += 1;
                        highest = Math.max(highest, newStreak);
                        shouldUpdate = true;
                    } else if (diffDays > 1) { // They missed a day!
                        newStreak = 1;
                        shouldUpdate = true;
                    } else if (diffDays === 0 && newStreak === 0) { // Edge case: date is today but streak is 0
                        newStreak = 1;
                        shouldUpdate = true;
                    }
                }

                if (shouldUpdate) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { currentStreak: newStreak, highestStreak: highest, lastStreakDate: today }
                    });
                }
                
                streakCache.set(userId, todayStr);
            }
        }
    } catch (err) {
        console.error("Streak processing error:", err);
    }

    res.status(200).json({ ok: true });
};
`;

const replaceRegex = /export const heartbeat = async [\s\S]*?res\.status\(200\)\.json\(\{ ok: true \}\);\n\};/m;

if (replaceRegex.test(code)) {
    code = code.replace(replaceRegex, streakLogic.trim());
    fs.writeFileSync('src/controllers/chat.controller.ts', code);
    console.log("Injected streak logic into heartbeat controller");
} else {
    console.log("Could not find heartbeat method to replace.");
}
