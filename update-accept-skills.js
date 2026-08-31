const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/mentorship.controller.ts', 'utf8');

const regex = /if \(receiverSkillId\) \{\s*\/\/ Receiver teaches Proposer\s*await prisma\.mentorship\.create\(\{\s*data: \{\s*swapId: swap\.id,\s*teacherId: swap\.receiverId,\s*studentId: swap\.proposerId,\s*skillId: receiverSkillId\s*\}\s*\}\);\s*\}/;

const replacement = `if (receiverSkillId) {
            // Receiver teaches Proposer (can be multiple comma-separated skills!)
            const skillIds = receiverSkillId.split(',');
            for (const sId of skillIds) {
                if (sId.trim()) {
                    await prisma.mentorship.create({
                        data: {
                            swapId: swap.id,
                            teacherId: swap.receiverId,
                            studentId: swap.proposerId,
                            skillId: sId.trim()
                        }
                    });
                }
            }
        }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('backend/src/controllers/mentorship.controller.ts', code);
    console.log("Updated acceptSwap to create multiple mentorships");
} else {
    console.log("Could not find regex in mentorship.controller.ts");
}
