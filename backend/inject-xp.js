const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

const fields = `
  // GAMIFICATION
  currentStreak   Int       @default(0)
  highestStreak   Int       @default(0)
  lastStreakDate  DateTime?
  xp              Int       @default(0)
`;

if (!code.includes('currentStreak')) {
    code = code.replace(
        '  isBanned     Boolean   @default(false)',
        '  isBanned     Boolean   @default(false)\n' + fields
    );
    if (!code.includes('currentStreak')) {
       // fallback replacement
       code = code.replace('isBanned     Boolean   @default(false)', 'isBanned     Boolean   @default(false)\n' + fields);
    }
    fs.writeFileSync('prisma/schema.prisma', code);
    console.log("Injected Gamification fields into schema.prisma");
} else {
    // Add just XP if streak exists but xp doesn't
    if (!code.includes('xp              Int')) {
        code = code.replace('currentStreak', 'xp              Int       @default(0)\n  currentStreak');
        fs.writeFileSync('prisma/schema.prisma', code);
        console.log("Injected just XP field into schema.prisma");
    } else {
        console.log("Fields already exist.");
    }
}
