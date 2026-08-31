const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');

code = code.replace(
    /lastStreakDate: now/g,
    'lastStreakDate: new Date()'
);

fs.writeFileSync('backend/src/controllers/user.controller.ts', code);
console.log("Fixed 'now' reference in user.controller.ts");
