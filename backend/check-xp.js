const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkXP() {
    const users = await prisma.user.findMany({ select: { name: true, xp: true, currentStreak: true, highestStreak: true }});
    console.log(users);
}
checkXP();
