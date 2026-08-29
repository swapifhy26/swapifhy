import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testOverview() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const [
            totalUsers, totalSwaps, totalPosts, totalLikes,
            totalComments, totalFollows, totalWaitlist, activeNow
        ] = await Promise.all([
            prisma.user.count(),
            prisma.swap.count(),
            prisma.post.count(),
            prisma.like.count(),
            prisma.comment.count(),
            prisma.follow.count(),
            prisma.waitlist.count(),
            prisma.user.count({ where: { lastActiveAt: { gte: fiveMinutesAgo } } })
        ]);

        const swapStatuses = await prisma.swap.groupBy({
            by: ["status"],
            _count: { _all: true }
        });

        console.log("Success:", { totalUsers, totalSwaps, activeNow });
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}
testOverview();
