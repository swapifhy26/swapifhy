const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const regex = /if \(!proposerId \|\| !receiverId\) \{ res\.status\(400\)\.json\(\{ error: "Participants not identified" \}\); return; \}\s*\/\/ Removed barrier: Unlimited pending requests/;

const replacement = `if (!proposerId || !receiverId) { res.status(400).json({ error: "Participants not identified" }); return; }

        // Removed barrier: Unlimited pending requests

        let swap = await prisma.swap.findFirst({
            where: {
                OR: [
                    { proposerId, receiverId },
                    { proposerId: receiverId, receiverId: proposerId }
                ]
            }
        });`;

code = code.replace(regex, replacement);

fs.writeFileSync('backend/src/controllers/chat.controller.ts', code);
console.log("Restored 'swap' declaration in chat.controller.ts");
