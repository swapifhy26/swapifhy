const fs = require('fs');
let code = fs.readFileSync('../backend/src/routes/admin.routes.ts', 'utf8');

const target1 = `const { id } = req.params;
        const { isRead } = req.body;
        const inquiry = await prisma.inquiry.update({`;
const new1 = `const id = req.params.id as string;
        const { isRead } = req.body;
        const inquiry = await prisma.inquiry.update({`;

const target2 = `const { id } = req.params;
        await prisma.inquiry.delete({`;
const new2 = `const id = req.params.id as string;
        await prisma.inquiry.delete({`;

code = code.replace(target1, new1).replace(target2, new2);

fs.writeFileSync('../backend/src/routes/admin.routes.ts', code);
console.log('Fixed TS error in admin.routes.ts');
