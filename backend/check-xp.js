const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdityas() {
    const users = await prisma.user.findMany({
        where: { name: { contains: "Aditya", mode: "insensitive" } },
        select: { id: true, name: true, xp: true, email: true, currentStreak: true, highestStreak: true }
    });
    console.log(users);
}
checkAdityas();
