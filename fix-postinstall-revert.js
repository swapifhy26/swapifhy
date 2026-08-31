const fs = require('fs');

let pkg = fs.readFileSync('backend/package.json', 'utf8');
const pkgObj = JSON.parse(pkg);

if (pkgObj.scripts.postinstall) {
    delete pkgObj.scripts.postinstall;
}

fs.writeFileSync('backend/package.json', JSON.stringify(pkgObj, null, 2));
console.log("Removed postinstall script");
