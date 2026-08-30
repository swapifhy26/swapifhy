const fs = require('fs');
let code = fs.readFileSync('src/pages/_app.tsx', 'utf8');

const targetAppBody = `const [isMaintenance, setIsMaintenance] = useState(false);`;
const newAppBody = `const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceRemark, setMaintenanceRemark] = useState("");
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);`;

if (code.includes(targetAppBody)) {
    code = code.replace(targetAppBody, newAppBody);
}

const targetFetch = `if (data.maintenanceMode) {
                    setIsMaintenance(true);
                } else {
                    setIsMaintenance(false);
                }`;
const newFetch = `if (data.maintenanceMode) {
                    setIsMaintenance(true);
                    setMaintenanceRemark(data.maintenanceRemark || "");
                    setMaintenanceEndTime(data.maintenanceEndTime || null);
                } else {
                    setIsMaintenance(false);
                }`;

if (code.includes(targetFetch)) {
    code = code.replace(targetFetch, newFetch);
}

const targetReturn = `if (isMaintenance && !isAdminRoute) {
        return <MaintenancePage />;
    }`;
const newReturn = `if (isMaintenance && !isAdminRoute) {
        return <MaintenancePage remark={maintenanceRemark} endTime={maintenanceEndTime} />;
    }`;

if (code.includes(targetReturn)) {
    code = code.replace(targetReturn, newReturn);
}

fs.writeFileSync('src/pages/_app.tsx', code);
console.log('_app.tsx updated');
