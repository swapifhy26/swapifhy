const fs = require('fs');

// --- 1. UPDATE USER CONTROLLER ---
let userCtrl = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');
const markStreakCode = `
export const markStreak = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user) { res.status(404).json({ error: "User not found" }); return; }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        let { currentStreak, highestStreak, lastStreakDate } = user;
        const lastStr = lastStreakDate ? new Date(lastStreakDate).toISOString().split('T')[0] : null;

        if (lastStr === todayStr) {
            res.status(400).json({ error: "Streak already marked for today!" });
            return;
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStr === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        if (currentStreak > highestStreak) highestStreak = currentStreak;

        await prisma.user.update({
            where: { id: userId },
            data: { currentStreak, highestStreak, lastStreakDate: now }
        });

        res.status(200).json({ currentStreak, highestStreak, lastStreakDate: now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to mark streak" });
    }
};
`;
userCtrl = userCtrl + '\n' + markStreakCode;
fs.writeFileSync('backend/src/controllers/user.controller.ts', userCtrl);

// --- 2. UPDATE USER ROUTES ---
let userRoutes = fs.readFileSync('backend/src/routes/user.routes.ts', 'utf8');
userRoutes = userRoutes.replace(
    'updateProfile, changePassword',
    'updateProfile, changePassword, markStreak'
);
userRoutes = userRoutes.replace(
    "router.put('/password', changePassword);",
    "router.put('/password', changePassword);\nrouter.post('/streak/mark', markStreak);"
);
fs.writeFileSync('backend/src/routes/user.routes.ts', userRoutes);

console.log("Backend streak endpoint injected");
