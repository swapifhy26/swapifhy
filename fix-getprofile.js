const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');

code = code.replace(
    'reputation: user.reputation,',
    `reputation: user.reputation,
                xp: user.xp,
                currentStreak: user.currentStreak,
                highestStreak: user.highestStreak,
                lastStreakDate: user.lastStreakDate,`
);

fs.writeFileSync('backend/src/controllers/user.controller.ts', code);
console.log("Added gamification stats to getProfile response");
