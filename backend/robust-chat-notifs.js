const fs = require('fs');
let code = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

// 1. Swap Request Notification
const initiateMatch = code.match(/swap = await prisma\.swap\.create\(\{[\s\S]*?\}\);\s+await prisma\.chatMessage\.create\(\{[\s\S]*?\}\);/);
if (initiateMatch) {
    const originalBlock = initiateMatch[0];
    const newBlock = originalBlock + `
            // Notify receiver about the new swap request
            await prisma.notification.create({
                data: {
                    userId: receiverId,
                    title: "New Swap Request",
                    message: \`You have a new swap request!\`,
                    type: "SWAP_REQUEST",
                    link: "/explore"
                }
            });`;
    if (!code.includes('type: "SWAP_REQUEST"')) {
        code = code.replace(originalBlock, newBlock);
    }
}

// 2. Message Notification
const messageMatch = code.match(/const message = await prisma\.chatMessage\.create\(\{[\s\S]*?\}\);/);
if (messageMatch) {
    const originalBlock = messageMatch[0];
    const newBlock = originalBlock + `
        // Notify the partner about the new message
        if (type !== "SYSTEM") {
            const partnerId = swap.proposerId === senderId ? swap.receiverId : swap.proposerId;
            
            // Just push a new notification
            await prisma.notification.create({
                data: {
                    userId: partnerId,
                    title: "New Message",
                    message: \`You received a new message.\`,
                    type: "NEW_MESSAGE",
                    link: "/explore"
                }
            });
        }`;
    if (!code.includes('type: "NEW_MESSAGE"')) {
        code = code.replace(originalBlock, newBlock);
    }
}

fs.writeFileSync('src/controllers/chat.controller.ts', code);
console.log('Successfully injected notifications in chat.controller.ts');
