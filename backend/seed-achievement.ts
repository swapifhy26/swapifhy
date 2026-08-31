import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No users found");
        return;
    }

    await prisma.post.create({
        data: {
            userId: user.id,
            type: "ACHIEVEMENT",
            content: "🎉 **SWAP COMPLETED!** @Aditya and @Tanchumma just crushed a swap in **UI/UX Design**!"
        }
    });
    console.log("Seeded achievement post!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
