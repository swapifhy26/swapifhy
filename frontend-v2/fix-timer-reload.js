const fs = require('fs');
let code = fs.readFileSync('src/components/MaintenancePage.tsx', 'utf8');

const targetTimer = `if (diff <= 0) {
                setTimeLeft("00:00:00");
                // The backend will automatically disable it on next health check
                return;
            }`;

const newTimer = `if (diff <= 0) {
                setTimeLeft("00:00:00");
                // Force an immediate reload so the user gets back in instantly without waiting for the 30s polling
                if (!window.maintenanceReloaded) {
                    window.maintenanceReloaded = true;
                    setTimeout(() => window.location.reload(), 1500);
                }
                return;
            }`;

if (code.includes(targetTimer)) {
    code = code.replace(targetTimer, newTimer);
    fs.writeFileSync('src/components/MaintenancePage.tsx', code);
    console.log('MaintenancePage.tsx timer logic updated to reload instantly');
} else {
    console.log('Could not find timer logic in MaintenancePage.tsx');
}
