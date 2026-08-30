const fs = require('fs');
let code = fs.readFileSync('../backend/src/app.ts', 'utf8');

const targetHealth = `app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        res.json({ 
            status: 'ok', 
            message: 'Swapifhy MVP API is running locally (TypeScript)',
            maintenanceMode: settings?.maintenanceMode || false,
            maintenanceEndTime: settings?.maintenanceEndTime || null,
            maintenanceRemark: settings?.maintenanceRemark || null
        });
    } catch (e) {
        res.json({ status: 'ok', message: 'Swapifhy MVP API is running locally (TypeScript)', maintenanceMode: false });
    }
});`;

const newHealth = `app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        let maintenanceMode = settings?.maintenanceMode || false;
        let maintenanceEndTime = settings?.maintenanceEndTime || null;
        let maintenanceRemark = settings?.maintenanceRemark || null;

        // Auto-disable if expired
        if (maintenanceMode && maintenanceEndTime && new Date() > new Date(maintenanceEndTime)) {
            if (settings && settings.id) {
                await prisma.systemSettings.update({
                    where: { id: settings.id },
                    data: { maintenanceMode: false, maintenanceEndTime: null, maintenanceRemark: null }
                });
                maintenanceMode = false;
                maintenanceEndTime = null;
                maintenanceRemark = null;
            }
        }

        res.json({ 
            status: 'ok', 
            message: 'Swapifhy MVP API is running locally (TypeScript)',
            maintenanceMode,
            maintenanceEndTime,
            maintenanceRemark
        });
    } catch (e) {
        res.json({ status: 'ok', message: 'Swapifhy MVP API is running locally (TypeScript)', maintenanceMode: false });
    }
});`;

if (code.includes(targetHealth)) {
    code = code.replace(targetHealth, newHealth);
    fs.writeFileSync('../backend/src/app.ts', code);
    console.log('Backend /api/health updated with auto-disable logic');
} else {
    console.log('Could not find /api/health block to replace');
}
