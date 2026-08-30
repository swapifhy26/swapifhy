const fs = require('fs');

// --- UPDATE MENTORSHIP CONTROLLER (ACCEPT, LEAVE, RATE) ---
let mentCode = fs.readFileSync('src/controllers/mentorship.controller.ts', 'utf8');

// 1. acceptSwap: +50 XP
mentCode = mentCode.replace(
    'data: { status: "ACCEPTED", proposerSkillId, receiverSkillId }\n        });',
    'data: { status: "ACCEPTED", proposerSkillId, receiverSkillId }\n        });\n        // Award XP for accepting a swap\n        await prisma.user.update({ where: { id: swap.receiverId }, data: { xp: { increment: 50 } } });'
);

// 2. rateTeacher: +20 XP for leaving a good review
mentCode = mentCode.replace(
    'const mRating = await prisma.mentorshipRating.create({\n            data: { mentorshipId: id, weekStarting: new Date(), rating, feedback }\n        });',
    'const mRating = await prisma.mentorshipRating.create({\n            data: { mentorshipId: id, weekStarting: new Date(), rating, feedback }\n        });\n        // Award XP for leaving a review\n        if (req.user?.id) await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 20 } } });'
);

// 3. leaveSwap: +500 XP for completing a swap course
mentCode = mentCode.replace(
    /if \(m\.targetDurationHours > 0 && totalHours < m\.targetDurationHours\) \{[\s\S]*?res\.status\(200\)\.json\(\{ success: true \}\);/m,
    `if (m.targetDurationHours > 0 && totalHours < m.targetDurationHours) {
            await prisma.user.update({
                where: { id: userId },
                data: { reputation: { decrement: 5 } }
            });
            await prisma.mentorship.update({ where: { id }, data: { status: "CANCELLED" }});
        } else {
            // Completed! Award +500 XP
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: 500 } }
            });
            await prisma.mentorship.update({ where: { id }, data: { status: "COMPLETED" }});
        }

        res.status(200).json({ success: true });`
);

fs.writeFileSync('src/controllers/mentorship.controller.ts', mentCode);

// --- UPDATE CHAT CONTROLLER (PROPOSE SWAP) ---
let chatCode = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

// 1. proposeSwap: +50 XP
chatCode = chatCode.replace(
    'await prisma.chatMessage.create({\n                data: {',
    '// Award XP for proposing a swap\n            await prisma.user.update({ where: { id: proposerId }, data: { xp: { increment: 50 } } });\n            await prisma.chatMessage.create({\n                data: {'
);

fs.writeFileSync('src/controllers/chat.controller.ts', chatCode);

// --- UPDATE USER CONTROLLER (SEND XP) ---
let userCode = fs.readFileSync('src/controllers/user.controller.ts', 'utf8');

// In getProfile, make sure it sends xp (it already sends full user object because of findUnique, but we ensure it)
// It does: const user = await prisma.user.findUnique... 
// It returns full user. So we are good.

console.log("Backend XP logic successfully injected.");
