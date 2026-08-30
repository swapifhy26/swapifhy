const fs = require('fs');
let code = fs.readFileSync('src/components/MaintenancePage.tsx', 'utf8');

const targetLogo = `className="mb-20"`;
const newLogo = `className="mb-10 md:mb-20"`;

if (code.includes(targetLogo)) {
    code = code.replace(targetLogo, newLogo);
    fs.writeFileSync('src/components/MaintenancePage.tsx', code);
    console.log('Logo margin fixed');
} else {
    console.log('Could not find logo margin');
}
