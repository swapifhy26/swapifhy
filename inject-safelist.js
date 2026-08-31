const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

// Inject tailwind safelist comment at the top of the file
const safelist = `// TAILWIND SAFELIST FOR DYNAMIC CLASSES
// bg-orange-500 bg-orange-500/15 text-orange-500 border-orange-500/50
// bg-secondary bg-secondary/15 text-secondary border-secondary/50
// bg-accent bg-accent/15 text-accent border-accent/50
// bg-primary bg-primary/15 text-primary border-primary/50
`;

if (!code.includes('TAILWIND SAFELIST')) {
    code = safelist + code;
}

fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Injected Tailwind safelist");
