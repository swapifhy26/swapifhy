const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/mentorship.controller.ts', 'utf8');

// Remove teacher limit
code = code.replace(
    /\/\/ Limit Check: Max 5 active students for the receiver[\s\S]*?return;\n        \}/,
    '// Removed barrier: Teachers can now teach unlimited students'
);

// Search for another limit check, e.g., for students
code = code.replace(
    /\/\/ Limit Check: Max 5 active mentorships for the proposer[\s\S]*?return;\n        \}/,
    '// Removed barrier: Students can now learn unlimited subjects'
);

// We should also check for "pending sent requests limit" in chat.controller.ts
let chatCode = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');
chatCode = chatCode.replace(
    /\/\/ Enforce max 5 pending sent requests limit[\s\S]*?return;\n        \}/,
    '// Removed barrier: Unlimited pending requests'
);

fs.writeFileSync('backend/src/controllers/mentorship.controller.ts', code);
fs.writeFileSync('backend/src/controllers/chat.controller.ts', chatCode);
console.log("Removed subject limits from backend");
