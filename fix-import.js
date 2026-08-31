const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

code = code.replace(
    'Globe, Search, Filter, SlidersHorizontal, X',
    'Globe, Search, Filter, SlidersHorizontal, X, CheckCircle2'
);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Added CheckCircle2 to imports in explore.tsx");
