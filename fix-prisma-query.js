const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const regex = /receiver: \{ select: \{ id: true, name: true, avatarUrl: true, bio: true \} \}\s*\},[\s\S]*?receiverId: true, archivedChat: true,[\s\S]*?bio: true \} \}\s*\}/;

const fixed = `receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } }
            }`;

code = code.replace(regex, fixed);
fs.writeFileSync('backend/src/controllers/chat.controller.ts', code);
console.log("Fixed Prisma query");
