const fs = require('fs');
let code = fs.readFileSync('../backend/src/routes/admin.routes.ts', 'utf8');

const endExport = `export default router;`;

const newRoutes = `
// "?"? GET ALL INQUIRIES "?"?
router.get("/inquiries", async (req: Request, res: Response) => {
    try {
        const inquiries = await prisma.inquiry.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error("Admin Inquiries Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch inquiries" });
    }
});

// "?"? MARK INQUIRY AS READ "?"?
router.put("/inquiries/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body;
        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: { isRead }
        });
        res.status(200).json(inquiry);
    } catch (error) {
        console.error("Admin Inquiries Update Error:", error);
        res.status(500).json({ error: "Failed to update inquiry" });
    }
});

// "?"? DELETE INQUIRY "?"?
router.delete("/inquiries/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.inquiry.delete({
            where: { id }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Admin Inquiries Delete Error:", error);
        res.status(500).json({ error: "Failed to delete inquiry" });
    }
});

export default router;`;

if (code.includes(endExport)) {
    code = code.replace(endExport, newRoutes);
    fs.writeFileSync('../backend/src/routes/admin.routes.ts', code);
    console.log('Inquiry admin routes added');
}
