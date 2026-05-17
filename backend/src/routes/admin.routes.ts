import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── ADMIN KEY GUARD ─────────────────────────────────────────────────────────
const adminGuard = (req: Request, res: Response, next: () => void): void => {
    const key = req.headers['x-admin-key'];
    const secret = process.env.ADMIN_SECRET;
    if (!secret || key !== secret) {
        res.status(401).json({ error: 'Unauthorized. Invalid or missing admin key.' });
        return;
    }
    next();
};

router.use(adminGuard as any);

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
// Core KPI counters: total users, swaps, posts, likes, comments, follows, waitlist
router.get('/overview', async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalSwaps,
            totalPosts,
            totalLikes,
            totalComments,
            totalFollows,
            totalWaitlist,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.swap.count(),
            prisma.post.count(),
            prisma.like.count(),
            prisma.comment.count(),
            prisma.follow.count(),
            prisma.waitlist.count(),
        ]);

        const swapStatuses = await prisma.swap.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        const statusMap: Record<string, number> = {};
        swapStatuses.forEach((s) => { statusMap[s.status] = s._count.status; });

        res.json({
            totalUsers,
            totalSwaps,
            totalPosts,
            totalLikes,
            totalComments,
            totalFollows,
            totalWaitlist,
            swapFunnel: {
                PENDING: statusMap['PENDING'] || 0,
                ACCEPTED: statusMap['ACCEPTED'] || 0,
                REJECTED: statusMap['REJECTED'] || 0,
                COMPLETED: statusMap['COMPLETED'] || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
});

// ─── GET /api/admin/growth ────────────────────────────────────────────────────
// Daily new user registrations for the last 30 days
router.get('/growth', async (req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const users = await prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        const waitlistEntries = await prisma.waitlist.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        // Build daily buckets
        const userDays: Record<string, number> = {};
        const waitlistDays: Record<string, number> = {};

        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            userDays[key] = 0;
            waitlistDays[key] = 0;
        }

        users.forEach((u) => {
            const key = u.createdAt.toISOString().slice(0, 10);
            if (userDays[key] !== undefined) userDays[key]++;
        });

        waitlistEntries.forEach((w) => {
            const key = w.createdAt.toISOString().slice(0, 10);
            if (waitlistDays[key] !== undefined) waitlistDays[key]++;
        });

        const chartData = Object.keys(userDays).map((date) => ({
            date,
            users: userDays[date],
            waitlist: waitlistDays[date],
        }));

        res.json({ chartData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch growth data' });
    }
});

// ─── GET /api/admin/skills ────────────────────────────────────────────────────
// Top 10 most-taught and most-wanted skills
router.get('/skills', async (req: Request, res: Response) => {
    try {
        const topTaught = await prisma.skillTeaching.groupBy({
            by: ['skillId'],
            _count: { skillId: true },
            orderBy: { _count: { skillId: 'desc' } },
            take: 10,
        });

        const topWanted = await prisma.skillLearning.groupBy({
            by: ['skillId'],
            _count: { skillId: true },
            orderBy: { _count: { skillId: 'desc' } },
            take: 10,
        });

        const taughtIds = topTaught.map((t) => t.skillId);
        const wantedIds = topWanted.map((t) => t.skillId);
        const allIds = [...new Set([...taughtIds, ...wantedIds])];

        const skills = await prisma.skill.findMany({
            where: { id: { in: allIds } },
            select: { id: true, name: true, category: true },
        });

        const skillMap: Record<string, { name: string; category: string }> = {};
        skills.forEach((s) => { skillMap[s.id] = { name: s.name, category: s.category }; });

        res.json({
            topTaught: topTaught.map((t) => ({
                skill: skillMap[t.skillId]?.name ?? t.skillId,
                category: skillMap[t.skillId]?.category ?? '',
                count: t._count.skillId,
            })),
            topWanted: topWanted.map((t) => ({
                skill: skillMap[t.skillId]?.name ?? t.skillId,
                category: skillMap[t.skillId]?.category ?? '',
                count: t._count.skillId,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch skills data' });
    }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Paginated user table with reputation, swap count, post count
router.get('/users', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    reputation: true,
                    createdAt: true,
                    avatarUrl: true,
                    _count: {
                        select: {
                            posts: true,
                            swapsProposed: true,
                            swapsReceived: true,
                            followers: true,
                        },
                    },
                },
            }),
            prisma.user.count(),
        ]);

        res.json({
            users: users.map((u) => ({
                ...u,
                swapCount: u._count.swapsProposed + u._count.swapsReceived,
                postCount: u._count.posts,
                followerCount: u._count.followers,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ─── GET /api/admin/engagement ────────────────────────────────────────────────
// Top 10 most-liked posts + posts per day for 14 days
router.get('/engagement', async (req: Request, res: Response) => {
    try {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const [rawTopPosts, recentPosts] = await Promise.all([
            prisma.post.findMany({
                take: 50,
                select: {
                    id: true,
                    content: true,
                    type: true,
                    createdAt: true,
                    user: { select: { name: true } },
                    _count: { select: { likes: true, comments: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.post.findMany({
                where: { createdAt: { gte: fourteenDaysAgo } },
                select: { createdAt: true },
            }),
        ]);

        const dayMap: Record<string, number> = {};
        for (let i = 0; i < 14; i++) {
            const d = new Date(fourteenDaysAgo);
            d.setDate(d.getDate() + i);
            dayMap[d.toISOString().slice(0, 10)] = 0;
        }
        recentPosts.forEach((p) => {
            const key = p.createdAt.toISOString().slice(0, 10);
            if (dayMap[key] !== undefined) dayMap[key]++;
        });

        // Sort in memory by likes count (avoids orderByRelation preview feature requirement)
        const topPosts = [...rawTopPosts].sort((a, b) => b._count.likes - a._count.likes).slice(0, 10);

        res.json({
            topPosts: topPosts.map((p) => ({
                id: p.id,
                preview: p.content.slice(0, 120),
                author: p.user.name,
                type: p.type,
                likes: p._count.likes,
                comments: p._count.comments,
                createdAt: p.createdAt,
            })),
            postsByDay: Object.entries(dayMap).map(([date, count]) => ({ date, count })),
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch engagement data' });
    }
});

// ─── GET /api/admin/waitlist ──────────────────────────────────────────────────
// Waitlist count + recent 20 emails + growth by day for 30 days
router.get('/waitlist', async (req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [total, recent, byDay] = await Promise.all([
            prisma.waitlist.count(),
            prisma.waitlist.findMany({
                orderBy: { createdAt: 'desc' },
                take: 25,
                select: { email: true, createdAt: true },
            }),
            prisma.waitlist.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true },
            }),
        ]);

        const dayMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            dayMap[d.toISOString().slice(0, 10)] = 0;
        }
        byDay.forEach((w) => {
            const key = w.createdAt.toISOString().slice(0, 10);
            if (dayMap[key] !== undefined) dayMap[key]++;
        });

        res.json({
            total,
            recent,
            chartData: Object.entries(dayMap).map(([date, count]) => ({ date, count })),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch waitlist data' });
    }
});

export default router;
