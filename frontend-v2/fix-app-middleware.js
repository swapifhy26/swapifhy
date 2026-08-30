const fs = require('fs');
let code = fs.readFileSync('../backend/src/app.ts', 'utf8');

const targetMiddleware = `// 2. Enforce Maintenance Mode Barrier
            if (settings.maintenanceMode) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Swapifhy is currently undergoing scheduled backend updates. Please try again shortly.'
                });
            }`;

const newMiddleware = `// 2. Enforce Maintenance Mode Barrier
            if (settings.maintenanceMode) {
                if (settings.maintenanceEndTime && new Date() > new Date(settings.maintenanceEndTime)) {
                    await prisma.systemSettings.update({
                        where: { id: settings.id },
                        data: { maintenanceMode: false, maintenanceEndTime: null, maintenanceRemark: null }
                    });
                } else {
                    return res.status(503).json({
                        error: 'Service Unavailable',
                        message: settings.maintenanceRemark || 'Swapifhy is currently undergoing scheduled backend updates. Please try again shortly.'
                    });
                }
            }`;

if (code.includes(targetMiddleware)) {
    code = code.replace(targetMiddleware, newMiddleware);
    fs.writeFileSync('../backend/src/app.ts', code);
    console.log('App middleware updated successfully!');
} else {
    console.log('Could not find middleware to replace');
}
