const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/chat.controller.ts', 'utf8');

const regex = /export const initiateSync = async \([\s\S]*?const \{ receiverId \} = req\.body;/;

const replacement = `export const initiateSync = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const proposerId = req.user?.id;
        const { receiverId, skillsToLearn } = req.body;

        let receiverSkillIds = null;
        if (skillsToLearn && Array.isArray(skillsToLearn) && skillsToLearn.length > 0) {
            const skills = await prisma.skill.findMany({
                where: { name: { in: skillsToLearn } }
            });
            receiverSkillIds = skills.map(s => s.id).join(',');
        }`;

code = code.replace(regex, replacement);

const createRegex = /swap = await prisma\.swap\.create\(\{\s*data: \{ proposerId, receiverId, status: "PENDING" \}\s*\}\);/;
code = code.replace(createRegex, `swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING", receiverSkillId: receiverSkillIds }
            });`);

const updateRegex = /swap = await prisma\.swap\.update\(\{\s*where: \{ id: swap\.id \},\s*data: \{ proposerId, receiverId, status: "PENDING" \}\s*\}\);/;
code = code.replace(updateRegex, `swap = await prisma.swap.update({
                where: { id: swap.id },
                data: { proposerId, receiverId, status: "PENDING", receiverSkillId: receiverSkillIds }
            });`);

fs.writeFileSync('backend/src/controllers/chat.controller.ts', code);
console.log("Updated initiateSync to handle multi-skill selection");
