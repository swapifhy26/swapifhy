const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const regex = /if \(\!swap\) \{\s*swap = await prisma\.swap\.create\(\{[\s\S]*?\}\);\s*\}/;

const replacement = `if (!swap) {
            swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING" }
            });
            // Award XP for proposing a swap
            await prisma.user.update({ where: { id: proposerId }, data: { xp: { increment: 50 } } });
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: "SYSTEM",
                    content: "Swap started! You can now message and share contact info. Please note: Every message is recorded. Chat appropriately. Violations hindering women's safety will be reported to authorities.",
                    type: "TEXT"
                }
            });
        } else if (swap.status === "ACCEPTED" || swap.status === "COMPLETED") {
            // Re-initiate swap using existing channel
            swap = await prisma.swap.update({
                where: { id: swap.id },
                data: { proposerId, receiverId, status: "PENDING" }
            });
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: "SYSTEM",
                    content: "A new swap has been requested!",
                    type: "TEXT"
                }
            });
        }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('backend/src/controllers/chat.controller.ts', code);
    console.log("Updated initiateSync to allow re-swaps");
} else {
    console.log("Could not find regex match in chat.controller.ts");
}
