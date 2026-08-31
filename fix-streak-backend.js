const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');

const regex = /export const markStreak = async \([\s\S]*?if \(currentStreak > highestStreak\) highestStreak = currentStreak;/;

const replacement = `export const markStreak = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user) { res.status(404).json({ error: "User not found" }); return; }

        const { timezoneOffset } = req.body;
        const tzOffsetMs = (timezoneOffset || 0) * 60 * 1000;
        
        // Shift time by user's timezone to get local date strings via ISO
        const localNow = new Date(Date.now() - tzOffsetMs);
        const todayStr = localNow.toISOString().split('T')[0];
        
        let { currentStreak, highestStreak, lastStreakDate } = user;
        const lastLocal = lastStreakDate ? new Date(lastStreakDate.getTime() - tzOffsetMs) : null;
        const lastStr = lastLocal ? lastLocal.toISOString().split('T')[0] : null;

        if (lastStr === todayStr) {
            res.status(400).json({ error: "Streak already marked for today!" });
            return;
        }

        const localYesterday = new Date(localNow.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = localYesterday.toISOString().split('T')[0];

        if (lastStr === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        if (currentStreak > highestStreak) highestStreak = currentStreak;`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('backend/src/controllers/user.controller.ts', code);
    console.log("Updated markStreak in user.controller.ts");
} else {
    console.log("Could not find regex in user.controller.ts");
}
