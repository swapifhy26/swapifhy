const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/mentorship.controller.ts', 'utf8');

// 1. Modify the findUnique to include teacher, student, and skill
code = code.replace(
    /const m = await prisma\.mentorship\.findUnique\(\{ where: \{ id \}, include: \{ classes: true \} \}\) as any;/,
    `const m = await prisma.mentorship.findUnique({ where: { id }, include: { classes: true, teacher: true, student: true, skill: true } }) as any;`
);

// 2. Modify the Completed logic to create the post
const completedRegex = /\/\/ Completed! Award \+500 XP[\s\S]*?await prisma\.mentorship\.update\(\{ where: \{ id \}, data: \{ status: "COMPLETED" \}\}\);/;

const injection = `// Completed! Award +500 XP
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: 500 } }
            });
            await prisma.mentorship.update({ where: { id }, data: { status: "COMPLETED" }});

            // Auto-generate achievement post
            await prisma.post.create({
                data: {
                    userId: m.teacherId,
                    type: "ACHIEVEMENT",
                    content: \`🎉 **SWAP COMPLETED!** @\${m.teacher.name} and @\${m.student.name} just crushed a swap in **\${m.skill.name}**!\`
                }
            });`;

if (code.includes('// Completed! Award +500 XP')) {
    code = code.replace(completedRegex, injection);
    fs.writeFileSync('backend/src/controllers/mentorship.controller.ts', code);
    console.log("Injected auto-post logic in backend");
} else {
    console.log("Could not find insertion point");
}
