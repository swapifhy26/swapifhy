const fs = require('fs');
let code = fs.readFileSync('../backend/src/routes/auth.routes.ts', 'utf8');

const endExport = `export default router;`;

const newRoutes = `
// "?"? PUBLIC ACTIONS "?"?
router.post('/inquiries', async (req, res) => {
    try {
        const { email, subject } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const inquiry = await prisma.inquiry.create({
            data: { email, subject: subject || null }
        });
        res.status(200).json({ success: true, inquiry });
    } catch (e) {
        console.error("Inquiry Error:", e);
        res.status(500).json({ error: "Failed to submit inquiry" });
    }
});

export default router;`;

if (code.includes(endExport)) {
    code = code.replace(endExport, newRoutes);
    fs.writeFileSync('../backend/src/routes/auth.routes.ts', code);
    console.log('Inquiry POST route added');
}
