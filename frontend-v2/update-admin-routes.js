const fs = require('fs');
let code = fs.readFileSync('../backend/src/routes/admin.routes.ts', 'utf8');

const targetPut = `const { maintenanceMode, allowRegistrations } = req.body;`;
const newPut = `const { maintenanceMode, allowRegistrations, maintenanceEndTime, maintenanceRemark } = req.body;`;

if (code.includes(targetPut)) {
    code = code.replace(targetPut, newPut);
}

const targetCreate = `maintenanceMode:       maintenanceMode       ?? false,
                      allowRegistrations: allowRegistrations ?? true`;
const newCreate = `maintenanceMode:       maintenanceMode       ?? false,
                      allowRegistrations: allowRegistrations ?? true,
                      maintenanceEndTime,
                      maintenanceRemark`;

if (code.includes(targetCreate)) {
    code = code.replace(targetCreate, newCreate);
}

const targetUpdate = `...(maintenanceMode      !== undefined && { maintenanceMode }),
                      ...(allowRegistrations !== undefined && { allowRegistrations })`;
const newUpdate = `...(maintenanceMode      !== undefined && { maintenanceMode }),
                      ...(allowRegistrations !== undefined && { allowRegistrations }),
                      ...(maintenanceEndTime !== undefined && { maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null }),
                      ...(maintenanceRemark !== undefined && { maintenanceRemark: maintenanceRemark || null })`;

if (code.includes(targetUpdate)) {
    code = code.replace(targetUpdate, newUpdate);
}

const targetRes = `maintenanceMode:      settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations`;
const newRes = `maintenanceMode:      settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations,
            maintenanceEndTime: settings.maintenanceEndTime,
            maintenanceRemark: settings.maintenanceRemark`;

if (code.includes(targetRes)) {
    // replace globally
    code = code.replace(new RegExp(targetRes.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), newRes);
}

fs.writeFileSync('../backend/src/routes/admin.routes.ts', code);
console.log('admin.routes.ts updated');
