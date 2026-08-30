const fs = require('fs');
let chatCtrl = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

const targetStr = `        let swap = await prisma.swap.findFirst({
            where: {
                OR: [
                    { proposerId, receiverId },
                    { proposerId: receiverId, receiverId: proposerId }
                ]
            }
        });`;

const replacement = `        // Enforce max 5 pending sent requests limit
        const pendingSent = await prisma.swap.count({
            where: { proposerId, status: "PENDING" }
        });
        
        let swap = await prisma.swap.findFirst({
            where: {
                OR: [
                    { proposerId, receiverId },
                    { proposerId: receiverId, receiverId: proposerId }
                ]
            }
        });
        
        if (!swap && pendingSent >= 5) {
            res.status(400).json({ error: "You can only have up to 5 pending sent swap requests at a time." });
            return;
        }`;

if (chatCtrl.includes(targetStr)) {
    chatCtrl = chatCtrl.replace(targetStr, replacement);
    fs.writeFileSync('../backend/src/controllers/chat.controller.ts', chatCtrl);
    console.log('Added 5 sent requests limit to chat.controller.ts');
} else {
    console.log('Target string not found in chat.controller.ts');
}
