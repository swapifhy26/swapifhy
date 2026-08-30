const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

code = code.replace(
    /loadWaitlist, loadSettings\]\);/g,
    'loadWaitlist, loadSettings, fetchInquiries]);'
);

fs.writeFileSync('src/pages/admin/index.tsx', code);
console.log('Fixed useEffect dependencies.');
