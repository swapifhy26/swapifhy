const fs = require('fs');

let chatTs = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

// 1. Inject SWAP_REQUEST notification
const swapCreateBlock = `swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING" }
            });
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: proposerId,
                    content: "Sync Protocol Initialized.",
                    type: "SYSTEM"
                }
            });`;

const newSwapCreateBlock = `swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING" }
            });
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: proposerId,
                    content: "Sync Protocol Initialized.",
                    type: "SYSTEM"
                }
            });
            
            // Notify receiver
            await prisma.notification.create({
                data: {
                    userId: receiverId,
                    title: "New Swap Request",
                    message: \`You have a new swap request!\`,
                    type: "SWAP_REQUEST",
                    link: "/progress"
                }
            });`;

if (chatTs.includes('swap = await prisma.swap.create')) {
    chatTs = chatTs.replace(swapCreateBlock, newSwapCreateBlock);
}

// 2. Inject NEW_MESSAGE notification
const sendMessageBlock = `        const newMsg = await prisma.chatMessage.create({
            data: {
                swapId,
                senderId: userId,
                content: content || "",
                type,
                details: details || {}
            }
        });`;

const newSendMessageBlock = `        const newMsg = await prisma.chatMessage.create({
            data: {
                swapId,
                senderId: userId,
                content: content || "",
                type,
                details: details || {}
            }
        });

        // Notify the partner if the message is from a user (not SYSTEM)
        if (type !== "SYSTEM") {
            const partnerId = swap.proposerId === userId ? swap.receiverId : swap.proposerId;
            // Delete old unread NEW_MESSAGE notifications for this swap (optional cleanup)
            // Or just create a new one
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

if (chatTs.includes('const newMsg = await prisma.chatMessage.create')) {
    chatTs = chatTs.replace(sendMessageBlock, newSendMessageBlock);
}

fs.writeFileSync('src/controllers/chat.controller.ts', chatTs);
console.log('Updated chat.controller.ts');
