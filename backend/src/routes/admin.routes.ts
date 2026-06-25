// src/routes/admin.routes.ts
// Fully corrected — all prisma model names, field names, and relation counts fixed

import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ── ADMIN SECURITY MIDDLEWARE ──
const verifyAdminKey = (req: Request, res: Response, next: NextFunction) => {
    const adminKey = req.headers["x-admin-key"];
    const systemAdminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || adminKey !== systemAdminKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing admin key." });
    }
    next();
};

router.use(verifyAdminKey);

// ── 1. OVERVIEW METRICS ──
router.get("/overview", async (req: Request, res: Response) => {
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

        const swapFunnel: Record<string, number> = {
            PENDING: 0, ACCEPTED: 0, REJECTED: 0, COMPLETED: 0
        };
        swapStatuses.forEach(item => {
            if (item.status in swapFunnel) {
                swapFunnel[item.status] = item._count._all;
            }
        });

        res.status(200).json({
            totalUsers, totalSwaps, totalPosts, totalLikes,
            totalComments, totalFollows, totalWaitlist, activeNow, swapFunnel
        });
    } catch (error) {
        console.error("Admin Overview Error:", error);
        res.status(500).json({ error: "Failed to fetch overview statistics." });
    }
});

// ── 2. GROWTH CHART DATA (LAST 30 DAYS) ──
router.get("/growth", async (req: Request, res: Response) => {
    try {
        const chartData = await prisma.$queryRaw`
            SELECT
                TO_CHAR(DATE_TRUNC('day', generated_date), 'YYYY-MM-DD') AS date,
                COALESCE(COUNT(DISTINCT u.id), 0)::int AS users,
                COALESCE(COUNT(DISTINCT w.id), 0)::int AS waitlist
            FROM
                GENERATE_SERIES(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day') AS generated_date
            LEFT JOIN "User" u ON DATE_TRUNC('day', u."createdAt") = DATE_TRUNC('day', generated_date)
            LEFT JOIN "Waitlist" w ON DATE_TRUNC('day', w."createdAt") = DATE_TRUNC('day', generated_date)
            GROUP BY generated_date
            ORDER BY generated_date ASC;
        `;
        res.status(200).json({ chartData });
    } catch (error) {
        console.error("Admin Growth Error:", error);
        res.status(500).json({ error: "Failed to fetch growth data." });
    }
});

// ── 3. SKILL METRICS ──
// FIX: Old code queried non-existent fields (type, usersCount) on Skill model.
//      Correct approach: count via SkillTeaching and SkillLearning join tables,
//      then sort and slice in JS — no schema changes needed.
router.get("/skills", async (req: Request, res: Response) => {
    try {
        const [taughtGroups, wantedGroups] = await Promise.all([
            prisma.skillTeaching.groupBy({
                by: ["skillId"],
                _count: { skillId: true },
                orderBy: { _count: { skillId: "desc" } },
                take: 10
            }),
            prisma.skillLearning.groupBy({
                by: ["skillId"],
                _count: { skillId: true },
                orderBy: { _count: { skillId: "desc" } },
                take: 10
            })
        ]);

        const taughtSkillIds = taughtGroups.map(g => g.skillId);
        const wantedSkillIds = wantedGroups.map(g => g.skillId);

        const [taughtSkills, wantedSkills] = await Promise.all([
            prisma.skill.findMany({ where: { id: { in: taughtSkillIds } } }),
            prisma.skill.findMany({ where: { id: { in: wantedSkillIds } } })
        ]);

        const taughtMap = Object.fromEntries(taughtSkills.map(s => [s.id, s]));
        const wantedMap = Object.fromEntries(wantedSkills.map(s => [s.id, s]));

        const topTaught = taughtGroups
            .filter(g => taughtMap[g.skillId])
            .slice(0, 5)
            .map(g => ({
                skill: taughtMap[g.skillId].name,
                category: taughtMap[g.skillId].category,
                count: g._count.skillId
            }));

        const topWanted = wantedGroups
            .filter(g => wantedMap[g.skillId])
            .slice(0, 5)
            .map(g => ({
                skill: wantedMap[g.skillId].name,
                category: wantedMap[g.skillId].category,
                count: g._count.skillId
            }));

        res.status(200).json({ topTaught, topWanted });
    } catch (error) {
        console.error("Admin Skills Error:", error);
        res.status(500).json({ error: "Failed to fetch skill metrics." });
    }
});

// ── 4. ENGAGEMENT LOGS (TOP POSTS) ──
// FIX: Old code queried likesCount/commentsCount (don't exist) and author relation
//      (doesn't exist — it's "user"). Fixed to use _count on relations.
router.get("/engagement", async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            where: { isArchived: false },
            include: {
                user: { select: { name: true, id: true } },
                _count: { select: { likes: true, comments: true } }
            }
        });

        // Sort by likes + comments combined engagement score
        posts.sort((a, b) =>
            (b._count.likes + b._count.comments) - (a._count.likes + a._count.comments)
        );

        const topPosts = posts.slice(0, 10).map(p => ({
            id: p.id,
            preview: p.content.slice(0, 100),
            content: p.content,
            author: p.user.name,
            userId: p.user.id,
            type: p.type,
            likes: p._count.likes,
            comments: p._count.comments,
            createdAt: p.createdAt.toISOString()
        }));

        res.status(200).json({ topPosts });
    } catch (error) {
        console.error("Admin Engagement Error:", error);
        res.status(500).json({ error: "Failed to fetch engagement data." });
    }
});

// ── 5. USER MANAGEMENT WITH PAGINATION & SEARCH ──
// FIX: _count.select used "swaps" which doesn't exist — relations are
//      swapsProposed and swapsReceived. Count both and sum in mapping.
router.get("/users", async (req: Request, res: Response) => {
    try {
        const page  = parseInt(req.query.page  as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const search = (req.query.search as string) || "";
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { name:  { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, name: true, email: true, reputation: true,
                    createdAt: true, avatarUrl: true, isBanned: true,
                    _count: {
                        select: {
                            swapsProposed: true,
                            swapsReceived: true,
                            posts: true,
                            followers: true
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        const formattedUsers = users.map(u => ({
            id:            u.id,
            name:          u.name,
            email:         u.email,
            reputation:    u.reputation,
            createdAt:     u.createdAt.toISOString(),
            avatarUrl:     u.avatarUrl,
            isBanned:      u.isBanned,
            // combine both swap directions into one count
            swapCount:     u._count.swapsProposed + u._count.swapsReceived,
            postCount:     u._count.posts,
            followerCount: u._count.followers
        }));

        res.status(200).json({
            users: formattedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

// ── 6. BAN / UNBAN ──
router.put("/users/:id/ban", async (req: Request, res: Response) => {
    const { id }     = req.params;
    const { banned } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data:  { isBanned: Boolean(banned) }
        });
        res.status(200).json({
            message:  "User ban status updated.",
            userId:   updatedUser.id,
            isBanned: updatedUser.isBanned
        });
    } catch (error) {
        console.error("Admin Ban Error:", error);
        res.status(500).json({ error: "Failed to update ban status." });
    }
});

// ── 7. PERMANENT USER DELETION ──
router.delete("/users/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ success: true, message: "User deleted." });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        res.status(500).json({ error: "Failed to delete user." });
    }
});

// ── 8. EDIT A POST ──
router.put("/posts/:id", async (req: Request, res: Response) => {
    const { id }      = req.params;
    const { content } = req.body;

    try {
        const updated = await prisma.post.update({
            where: { id },
            data:  { content }
        });
        res.status(200).json({ success: true, postId: updated.id });
    } catch (error) {
        console.error("Admin Edit Post Error:", error);
        res.status(500).json({ error: "Failed to update post." });
    }
});

// ── 9. CLEAR ALL POSTS ──
// NOTE: must be registered BEFORE /posts/:id to avoid Express matching "all" as an id
router.delete("/posts/all", async (req: Request, res: Response) => {
    try {
        const result = await prisma.post.deleteMany();
        res.status(200).json({
            success: true,
            message: "All posts deleted.",
            count:   result.count
        });
    } catch (error) {
        console.error("Admin Clear Posts Error:", error);
        res.status(500).json({ error: "Failed to clear posts." });
    }
});

// ── 10. DELETE A SINGLE POST ──
router.delete("/posts/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Post deleted." });
    } catch (error) {
        console.error("Admin Delete Post Error:", error);
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// ── 11. GET WAITLIST ──
router.get("/waitlist", async (req: Request, res: Response) => {
    try {
        const [total, recent] = await Promise.all([
            prisma.waitlist.count(),
            prisma.waitlist.findMany({
                take: 15,
                orderBy: { createdAt: "desc" }
            })
        ]);
        res.status(200).json({ total, recent });
    } catch (error) {
        console.error("Admin Waitlist Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch waitlist." });
    }
});

// ── 12. ADD TO WAITLIST ──
router.post("/waitlist", async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }
    try {
        const entry = await prisma.waitlist.create({ data: { email } });
        res.status(201).json(entry);
    } catch (error) {
        console.error("Admin Waitlist Add Error:", error);
        res.status(500).json({ error: "Failed to add email to waitlist." });
    }
});

// ── 13. REMOVE FROM WAITLIST ──
router.delete("/waitlist/:idOrEmail", async (req: Request, res: Response) => {
    const { idOrEmail } = req.params;
    try {
        const where = idOrEmail.includes("@")
            ? { email: idOrEmail }
            : { id:    idOrEmail };
        await prisma.waitlist.delete({ where });
        res.status(200).json({ success: true, message: "Removed from waitlist." });
    } catch (error) {
        console.error("Admin Waitlist Remove Error:", error);
        res.status(500).json({ error: "Failed to remove from waitlist." });
    }
});

// ── 14. GET PLATFORM SETTINGS ──
// FIX: was prisma.settings (wrong) → prisma.systemSettings (correct model name)
router.get("/settings", async (req: Request, res: Response) => {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { maintenanceMode: false, allowNewRegistrations: true }
            });
        }

        res.status(200).json({
            maintenanceMode:      settings.maintenanceMode,
            allowNewRegistrations: settings.allowNewRegistrations
        });
    } catch (error) {
        console.error("Admin Settings Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch settings." });
    }
});

// ── 15. UPDATE PLATFORM SETTINGS ──
// FIX: was prisma.settings → prisma.systemSettings
router.put("/settings", async (req: Request, res: Response) => {
    try {
        const { maintenanceMode, allowNewRegistrations } = req.body;

        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    maintenanceMode:       maintenanceMode       ?? false,
                    allowNewRegistrations: allowNewRegistrations ?? true
                }
            });
        } else {
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    ...(maintenanceMode      !== undefined && { maintenanceMode }),
                    ...(allowNewRegistrations !== undefined && { allowNewRegistrations })
                }
            });
        }

        res.status(200).json({
            maintenanceMode:      settings.maintenanceMode,
            allowNewRegistrations: settings.allowNewRegistrations
        });
    } catch (error) {
        console.error("Admin Settings Update Error:", error);
        res.status(500).json({ error: "Failed to save settings." });
    }
});

export default router;
