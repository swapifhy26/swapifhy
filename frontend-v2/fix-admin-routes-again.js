const fs = require('fs');
let code = fs.readFileSync('../backend/src/routes/admin.routes.ts', 'utf8');

// Target the update block
const updateRegex = /\.\.\.\(maintenanceMode\s*!==\s*undefined\s*&&\s*\{\s*maintenanceMode\s*\}\),\s*\.\.\.\(allowRegistrations\s*!==\s*undefined\s*&&\s*\{\s*allowRegistrations\s*\}\)/g;
const newUpdate = `...(maintenanceMode !== undefined && { maintenanceMode }),
                    ...(allowRegistrations !== undefined && { allowRegistrations }),
                    ...(maintenanceEndTime !== undefined && { maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null }),
                    ...(maintenanceRemark !== undefined && { maintenanceRemark: maintenanceRemark || null })`;

if (updateRegex.test(code)) {
    code = code.replace(updateRegex, newUpdate);
    console.log('Update block fixed');
}

// Target the create block
const createRegex = /maintenanceMode:\s*maintenanceMode\s*\?\?\s*false,\s*allowRegistrations:\s*allowRegistrations\s*\?\?\s*true/g;
const newCreate = `maintenanceMode: maintenanceMode ?? false,
                    allowRegistrations: allowRegistrations ?? true,
                    maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
                    maintenanceRemark: maintenanceRemark || null`;

if (createRegex.test(code)) {
    code = code.replace(createRegex, newCreate);
    console.log('Create block fixed');
}

fs.writeFileSync('../backend/src/routes/admin.routes.ts', code);
