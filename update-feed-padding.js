const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

code = code.replace(
    /className="max-w-\[1080px\] mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8"/,
    'className="max-w-[1080px] mx-auto px-4 sm:px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8"'
);

fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Updated feed layout padding for mobile");
