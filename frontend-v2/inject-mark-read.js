const fs = require('fs');
let code = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

const getMessagesStart = `        if (swap.proposerId !== userId && swap.receiverId !== userId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }

        const messages = await prisma.chatMessage.findMany({`;

const newGetMessagesStart = `        if (swap.proposerId !== userId && swap.receiverId !== userId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }

        // Mark unread messages from the partner as read
        await prisma.chatMessage.updateMany({
            where: { swapId, senderId: { not: userId }, isRead: false },
            data: { isRead: true }
        });

        const messages = await prisma.chatMessage.findMany({`;

if (code.includes(getMessagesStart)) {
    code = code.replace(getMessagesStart, newGetMessagesStart);
    fs.writeFileSync('../backend/src/controllers/chat.controller.ts', code);
    console.log('Injected mark-as-read logic into getMessages');
} else {
    console.log('Could not find getMessagesStart block');
}
