const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

// Replace the onClick handler
const targetButton = /onClick=\{\(\)\s*=>\s*setMaintenanceMode\(m\s*=>\s*!m\)\}/g;
const replacement = `onClick={() => handleMaintenanceToggle(!maintenanceMode)}`;

if (targetButton.test(code)) {
    code = code.replace(targetButton, replacement);
    fs.writeFileSync('src/pages/admin/index.tsx', code);
    console.log('Button onClick updated');
} else {
    console.log('Could not find target button');
}
