const fs = require('fs');

let mentorTs = fs.readFileSync('src/controllers/mentorship.controller.ts', 'utf8');

const updateSwapBlock = `        // Update swap status
        await prisma.swap.update({
            where: { id: swapId },
            data: { status: "ACCEPTED", proposerSkillId, receiverSkillId }
        });`;

const newUpdateSwapBlock = `        // Update swap status
        await prisma.swap.update({
            where: { id: swapId },
            data: { status: "ACCEPTED", proposerSkillId, receiverSkillId }
        });
        
        // Notify proposer that swap was accepted
        await prisma.notification.create({
            data: {
                userId: swap.proposerId,
                title: "Swap Accepted",
                message: \`Your swap request was accepted!\`,
                type: "SWAP_ACCEPTED",
                link: "/progress"
            }
        });`;

if (mentorTs.includes('await prisma.swap.update')) {
    mentorTs = mentorTs.replace(updateSwapBlock, newUpdateSwapBlock);
}

fs.writeFileSync('src/controllers/mentorship.controller.ts', mentorTs);
console.log('Updated mentorship.controller.ts');
