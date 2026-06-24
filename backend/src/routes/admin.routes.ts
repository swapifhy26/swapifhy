const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ── ADMIN SECURITY MIDDLEWARE ──
// Verifies the incoming "x-admin-key" against the secret environment variable
const verifyAdminKey = (req, res, next) => {
    const adminKey = req.headers["x-admin-key"];
    const systemAdminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || adminKey !== systemAdminKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing admin key." });
    }
    next();
};

// Protect all sub-routes defined below with the admin key check
router.use(verifyAdminKey);

// ── 1. OVERVIEW METRICS ──
router.get("/overview", async (req, res) => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Fetch all cumulative metric counters concurrently
        const [
            totalUsers,
            totalSwaps,
            totalPosts,
            totalLikes,
            totalComments,
            totalFollows,
            totalWaitlist,
            activeNow
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

        // Gather all categorical values for the funnel chart
        const swapStatuses = await prisma.swap.groupBy({
            by: ["status"],
            _count: { _all: true }
        });

        // Map database response directly onto frontend key expectations
        const swapFunnel = { PENDING: 0, ACCEPTED: 0, REJECTED: 0, COMPLETED: 0 };
        swapStatuses.forEach(item => {
            if (swapFunnel.hasOwnProperty(item.status)) {
                swapFunnel[item.status] = item._count._all;
            }
        });

        res.status(200).json({
            totalUsers,
            totalSwaps,
            totalPosts,
            totalLikes,
            totalComments,
            totalFollows,
            totalWaitlist,
            activeNow,
            swapFunnel
        });
    } catch (error) {
        console.error("Admin Overview Fetch Error:", error);
        res.status(500).json({ error: "Failed to assemble operational system overview statistics." });
    }
});

// ── 2. GROWTH CHART DATA (LAST 30 DAYS) ──
router.get("/growth", async (req, res) => {
    try {
        // Generates an incremental timeline cross-referencing daily account creations
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
        console.error("Admin Growth Fetch Error:", error);
        res.status(500).json({ error: "Failed to query historical platform data trends." });
    }
});

// ── 3. SKILL METRICS ──
router.get("/skills", async (req, res) => {
    try {
        const topTaught = await prisma.skill.findMany({
            where: { type: "TEACH" },
            take: 5,
            orderBy: { usersCount: "desc" },
            select: { skill: true, category: true, usersCount: true }
        });

        const topWanted = await prisma.skill.findMany({
            where: { type: "LEARN" },
            take: 5,
            orderBy: { usersCount: "desc" },
            select: { skill: true, category: true, usersCount: true }
        });

        res.status(200).json({
            topTaught: topTaught.map(s => ({ skill: s.skill, category: s.category, count: s.usersCount })),
            topWanted: topWanted.map(s => ({ skill: s.skill, category: s.category, count: s.usersCount }))
        });
    } catch (error) {
        console.error("Admin Skills Fetch Error:", error);
        res.status(500).json({ error: "Failed to parse system catalog skill data metrics." });
    }
});

// ── 4. ENGAGEMENT LOGS (TOP POSTS) ──
router.get("/engagement", async (req, res) => {
    try {
        const topPosts = await prisma.post.findMany({
            take: 10,
            orderBy: [
                { likesCount: "desc" },
                { commentsCount: "desc" }
            ],
            include: { author: { select: { name: true, id: true } } }
        });

        const formattedPosts = topPosts.map(p => ({
            id: p.id,
            preview: p.content.slice(0, 100),
            content: p.content,
            author: p.author.name,
            userId: p.author.id,
            type: p.type || "text",
            likes: p.likesCount,
            comments: p.commentsCount,
            createdAt: p.createdAt.toISOString()
        }));

        res.status(200).json({ topPosts: formattedPosts });
    } catch (error) {
        console.error("Admin Engagement Fetch Error:", error);
        res.status(500).json({ error: "Failed to safely slice community engagement logs." });
    }
});

// ── 5. USER MANAGEMENT LAYER WITH PAGINATION & SEARCH ──
router.get("/users", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const whereCondition = search ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, name: true, email: true, reputation: true,
                    createdAt: true, avatarUrl: true, isBanned: true,
                    _count: { select: { swaps: true, posts: true, followers: true } }
                }
            }),
            prisma.user.count({ where: whereCondition })
        ]);

        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            reputation: u.reputation,
            createdAt: u.createdAt.toISOString(),
            avatarUrl: u.avatarUrl,
            isBanned: u.isBanned || false,
            swapCount: u._count.swaps,
            postCount: u._count.posts,
            followerCount: u._count.followers
        }));

        res.status(200).json({
            users: formattedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin Users Query Error:", error);
        res.status(500).json({ error: "Failed to isolate filtered user directory." });
    }
});

// ── 6. BAN / UNBAN WORKFLOWS ──
router.put("/users/:id/ban", async (req, res) => {
    const { id } = req.params;
    const { banned } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isBanned: banned }
        });
        res.status(200).json({ 
            message: "User account status flag successfully overridden.", 
            userId: updatedUser.id, 
            isBanned: updatedUser.isBanned 
        });
    } catch (error) {
        console.error("Admin User Ban Mod Error:", error);
        res.status(500).json({ error: "Failed to apply suspension update criteria." });
    }
});

// ── 7. PERMANENT USER DELETION ──
router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ success: true, message: "User records fully dropped from database context." });
    } catch (error) {
        console.error("Admin User Purge Error:", error);
        res.status(500).json({ error: "Failed to remove the requested user reference records." });
    }
});

// ── 8. UPDATE ACTIVE CONTENT POSTS ──
router.put("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const updatedPost = await prisma.post.update({
            where: { id },
            data: { content }
        });
        res.status(200).json({ success: true, postId: updatedPost.id });
    } catch (error) {
        console.error("Admin Post Edit Error:", error);
        res.status(500).json({ error: "Failed to overwrite resource database file strings." });
    }
});

// ── 9. DELETE CONTENT POSTS ──
router.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Post drop complete." });
    } catch (error) {
        console.error("Admin Post Deletion Error:", error);
        res.status(500).json({ error: "Failed to clear specified post payload entry." });
    }
});

// ── 10. WAITLIST ROSTER GET ──
router.get("/waitlist", async (req, res) => {
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
        res.status(500).json({ error: "Failed to fetch waitlist state values." });
    }
});

// ── 11. WAITLIST ROSTER ADD ──
router.post("/waitlist", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "A valid email property sequence must be configured." });

    try {
        const entry = await prisma.waitlist.create({ data: { email } });
        res.status(201).json(entry);
    } catch (error) {
        console.error("Admin Waitlist Add Error:", error);
        res.status(500).json({ error: "Failed to insert requested entity pointer to waitlist database table." });
    }
});

// ── 12. WAITLIST ROSTER DELETION ──
router.delete("/waitlist/:idOrEmail", async (req, res) => {
    const { idOrEmail } = req.params;
    try {
        const identification = idOrEmail.includes("@") ? { email: idOrEmail } : { id: idOrEmail };
        await prisma.waitlist.delete({ where: identification });
        res.status(200).json({ success: true, message: "Roster index cleaned." });
    } catch (error) {
        console.error("Admin Waitlist Clear Error:", error);
        res.status(500).json({ error: "Failed to delete target item from registry." });
    }
});

// ── 13. FETCH PLATFORM CONFIGURATION RULES ──
router.get("/settings", async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findFirst();
        
        // Auto-initialize with standard configurations if the settings document doesn't exist yet
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { id: "global_config", maintenanceMode: false, allowRegistrations: true }
            });
        }
        
        res.status(200).json({
            maintenanceMode: settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations
        });
    } catch (error) {
        console.error("Admin Settings Fetch Error:", error);
        res.status(500).json({ error: "Failed to parse platform engine rule settings." });
    }
});

// ── 14. PATCH / UPDATE PLATFORM CONFIGURATION RULES ──
router.put("/settings", async (req, res) => {
    try {
        const { maintenanceMode, allowRegistrations } = req.body;

        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    id: "global_config",
                    maintenanceMode: maintenanceMode ?? false,
                    allowRegistrations: allowRegistrations ?? true
                }
            });
        } else {
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    ...(maintenanceMode !== undefined && { maintenanceMode }),
                    ...(allowRegistrations !== undefined && { allowRegistrations })
                }
            });
        }

        res.status(200).json({
            maintenanceMode: settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations
        });
    } catch (error) {
        console.error("Admin Settings Update Error:", error);
        res.status(500).json({ error: "Failed to save rewritten system rules configuration." });
    }
});

module.exports = router;
