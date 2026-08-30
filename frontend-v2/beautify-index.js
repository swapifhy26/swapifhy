const fs = require('fs');
let code = fs.readFileSync('src/pages/index.tsx', 'utf8');

code = code.replace(/text-5xl md:text-7xl/g, 'text-4xl sm:text-5xl md:text-7xl');
code = code.replace(/text-4xl md:text-5xl/g, 'text-3xl sm:text-4xl md:text-5xl');

fs.writeFileSync('src/pages/index.tsx', code);
console.log("Beautified index.tsx typography for mobile");
