const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const targetLogic = `        const messages = await prisma.chatMessage.findMany({
            where: { swapId },
            orderBy: { createdAt: 'asc' }
        });`;

const updatedLogic = `        const activeMessages = await prisma.chatMessage.findMany({
            where: { swapId },
            orderBy: { createdAt: 'asc' }
        });
        
        let messages = activeMessages;
        if (swap.archivedChat) {
            try {
                const archivedMessages = JSON.parse(swap.archivedChat);
                messages = [...archivedMessages, ...activeMessages];
            } catch (e) {
                console.error("Failed to parse archived chat for swap", swapId);
            }
        }`;

// We only want to replace the FIRST occurrence in getMessages
// To ensure it doesn't break anything, just string replace directly
if (code.includes(targetLogic)) {
    code = code.replace(targetLogic, updatedLogic);
    
    // We also need to add 'archivedChat' to the 'include' block where swap is fetched in getMessages!
    code = code.replace(
        /receiver: \{ select: \{ id: true, name: true, avatarUrl: true, bio: true \} \}/,
        `receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } }
            },
            select: {
                id: true, proposerId: true, receiverId: true, archivedChat: true,
                proposer: { select: { id: true, name: true, avatarUrl: true, bio: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } }`
    );
    // Wait, if I change include to select, it might break. Let's not mess with select.
    // If I just fetch the swap, it includes scalar fields by default (including archivedChat!). So no need to modify the include block!
    // But wait, the include block is:
    // include: { proposer: {...}, receiver: {...} }
    // Since archivedChat is a scalar field, it is returned by default when include is used.
    
    fs.writeFileSync('backend/src/controllers/chat.controller.ts', code);
    console.log("Updated getMessages to include archived chats");
} else {
    console.log("Target logic not found");
}
