const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

const streakFields = `
    // GAMIFICATION & STREAKS
    currentStreak   Int       @default(0)
    highestStreak   Int       @default(0)
    lastStreakDate  DateTime?
`;

if (!code.includes('currentStreak')) {
    code = code.replace(
        '    isBanned     Boolean   @default(false)',
        '    isBanned     Boolean   @default(false)\n' + streakFields
    );
    fs.writeFileSync('prisma/schema.prisma', code);
    console.log("Injected streak fields into schema.prisma");
} else {
    console.log("Streak fields already exist.");
}
