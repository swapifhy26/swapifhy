const fs = require('fs');

let pkg = fs.readFileSync('backend/package.json', 'utf8');
const pkgObj = JSON.parse(pkg);

if (!pkgObj.scripts.postinstall) {
    pkgObj.scripts.postinstall = "prisma generate";
}

fs.writeFileSync('backend/package.json', JSON.stringify(pkgObj, null, 2));
console.log("Added postinstall script for prisma generate");
