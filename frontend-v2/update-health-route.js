const fs = require('fs');
let code = fs.readFileSync('../backend/src/app.ts', 'utf8');

const target = `app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Swapifhy MVP API is running locally (TypeScript)' });
});`;

const replacement = `app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        res.json({ 
            status: 'ok', 
            message: 'Swapifhy MVP API is running locally (TypeScript)',
            maintenanceMode: settings?.maintenanceMode || false 
        });
    } catch (e) {
        res.json({ status: 'ok', message: 'Swapifhy MVP API is running locally (TypeScript)', maintenanceMode: false });
    }
});`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('../backend/src/app.ts', code);
    console.log('Updated /api/health to include maintenanceMode');
} else {
    console.log('Could not find target block in app.ts');
}
