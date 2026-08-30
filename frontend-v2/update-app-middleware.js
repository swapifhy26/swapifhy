const fs = require('fs');
let code = fs.readFileSync('../backend/src/app.ts', 'utf8');

// Update /api/health
const targetHealth = `res.json({ 
            status: 'ok', 
            message: 'Swapifhy MVP API is running locally (TypeScript)',
            maintenanceMode: settings?.maintenanceMode || false 
        });`;
const newHealth = `res.json({ 
            status: 'ok', 
            message: 'Swapifhy MVP API is running locally (TypeScript)',
            maintenanceMode: settings?.maintenanceMode || false,
            maintenanceEndTime: settings?.maintenanceEndTime || null,
            maintenanceRemark: settings?.maintenanceRemark || null
        });`;

if (code.includes(targetHealth)) {
    code = code.replace(targetHealth, newHealth);
}

// Update the middleware block
const targetMiddleware = `// 2. Enforce Maintenance Mode Barrier
        if (settings.maintenanceMode) {
            return res.status(503).json({ error: "MAINTENANCE_MODE_ACTIVE", message: "The Identity Protocol is currently undergoing critical maintenance and network adjustments." });
        }`;

const newMiddleware = `// 2. Enforce Maintenance Mode Barrier
        if (settings.maintenanceMode) {
            // Auto-off logic
            if (settings.maintenanceEndTime && new Date() > new Date(settings.maintenanceEndTime)) {
                await prisma.systemSettings.update({
                    where: { id: settings.id },
                    data: { maintenanceMode: false, maintenanceEndTime: null, maintenanceRemark: null }
                });
                // let request proceed
            } else {
                return res.status(503).json({ 
                    error: "MAINTENANCE_MODE_ACTIVE", 
                    message: settings.maintenanceRemark || "The Identity Protocol is currently undergoing critical maintenance and network adjustments." 
                });
            }
        }`;

if (code.includes(targetMiddleware)) {
    code = code.replace(targetMiddleware, newMiddleware);
}

fs.writeFileSync('../backend/src/app.ts', code);
console.log('app.ts middleware updated');
