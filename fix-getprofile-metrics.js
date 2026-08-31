const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');

// We need to inject logic into getProfile.
// Let's find getProfile:
/*
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } }
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
*/

const injection = `
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsTeaching: { include: { skill: true } },
                skillsLearning: { include: { skill: true } }
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Calculate Gamification & Mentorship stats dynamically
        const totalSwapsCount = await prisma.mentorship.count({
            where: { OR: [{ teacherId: userId }, { studentId: userId }] }
        });

        const taughtClasses = await prisma.mentorshipClass.aggregate({
            where: { mentorship: { teacherId: userId }, isCompleted: true },
            _sum: { durationMinutes: true }
        });
        const hoursTaught = Math.round((taughtClasses._sum.durationMinutes || 0) / 60 * 10) / 10;

        const learnedClasses = await prisma.mentorshipClass.aggregate({
            where: { mentorship: { studentId: userId }, isCompleted: true },
            _sum: { durationMinutes: true }
        });
        const hoursLearned = Math.round((learnedClasses._sum.durationMinutes || 0) / 60 * 10) / 10;

        const ratings = await prisma.mentorshipRating.aggregate({
            where: { mentorship: { teacherId: userId } },
            _avg: { rating: true }
        });
        const avgRating = ratings._avg.rating ? Math.round(ratings._avg.rating * 10) / 10 : 0;
`;

code = code.replace(
    /const user = await prisma\.user\.findUnique\(\{\s*where: \{ id: userId \},\s*include: \{\s*skillsTeaching: \{ include: \{ skill: true \} \},\s*skillsLearning: \{ include: \{ skill: true \} \}\s*\}\s*\}\);\s*if \(\!user\) \{\s*res\.status\(404\)\.json\(\{ error: "User not found" \}\);\s*return;\s*\}/,
    injection
);

// Now inject them into the return JSON
const returnInjection = `
                xp: user.xp,
                currentStreak: user.currentStreak,
                highestStreak: user.highestStreak,
                lastStreakDate: user.lastStreakDate,
                totalSwaps: totalSwapsCount,
                hoursTaught: hoursTaught,
                hoursLearned: hoursLearned,
                avgRating: avgRating,
`;

code = code.replace(
    /xp: user\.xp,\s*currentStreak: user\.currentStreak,\s*highestStreak: user\.highestStreak,\s*lastStreakDate: user\.lastStreakDate,/,
    returnInjection
);

fs.writeFileSync('backend/src/controllers/user.controller.ts', code);
console.log("Injected calculated metrics into getProfile");
