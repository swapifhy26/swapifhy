const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function giveXP() {
    await prisma.user.updateMany({
        where: { name: { contains: "Aditya", mode: "insensitive" } },
        data: { xp: 1250, currentStreak: 3, highestStreak: 7 }
    });
    console.log("Gave 1250 XP to Aditya");
}
giveXP();
