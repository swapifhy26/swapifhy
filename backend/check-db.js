const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const msgs = await prisma.chatMessage.findMany({
        where: {
            content: { contains: "WARNING" }
        }
    });
    console.log(msgs);
}

check();
