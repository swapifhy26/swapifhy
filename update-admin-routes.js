const fs = require('fs');

let adminRoutes = fs.readFileSync('backend/src/routes/admin.routes.ts', 'utf8');

const adminTicketsRoute = `

// "?"? GET SUPPORT TICKETS (AUTO-DELETE > 3 DAYS) "?"?
router.get("/tickets", async (req: Request, res: Response) => {
    try {
        // 1. Delete tickets older than 3 days
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        await prisma.supportTicket.deleteMany({
            where: { createdAt: { lt: threeDaysAgo } }
        });

        // 2. Fetch remaining tickets
        const tickets = await prisma.supportTicket.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        res.json({ tickets });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});
`;

adminRoutes = adminRoutes.replace(
    /export default router;/,
    adminTicketsRoute + '\nexport default router;'
);

fs.writeFileSync('backend/src/routes/admin.routes.ts', adminRoutes);
console.log("Added /tickets to admin.routes.ts");
