const fs = require('fs');

let pkg = fs.readFileSync('backend/package.json', 'utf8');

pkg = pkg.replace(
    '"build": "tsc",',
    '"build": "npx prisma generate && tsc",'
);

fs.writeFileSync('backend/package.json', pkg);
console.log("Updated backend build script to run prisma generate");
