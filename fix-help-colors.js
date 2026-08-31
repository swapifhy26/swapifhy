const fs = require('fs');

// 1. Update globals.css to improve light mode font colors
let css = fs.readFileSync('frontend-v2/src/styles/globals.css', 'utf8');
// Make muted-foreground darker in light mode for better readability
css = css.replace(
    /--color-muted-foreground: hsl\(232, 15%, 45%\);/g,
    '--color-muted-foreground: hsl(232, 15%, 35%); /* Improved contrast for light mode */'
);
fs.writeFileSync('frontend-v2/src/styles/globals.css', css);

// 2. Inject safelist into help.tsx so Tailwind bundles the colors
let help = fs.readFileSync('frontend-v2/src/pages/help.tsx', 'utf8');
const safelist = `// TAILWIND SAFELIST FOR DYNAMIC CLASSES
// bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]
// bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-500/20 hover:bg-blue-600
// bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] shadow-rose-500/20 hover:bg-rose-600
`;

if (!help.includes('TAILWIND SAFELIST')) {
    help = safelist + help;
    fs.writeFileSync('frontend-v2/src/pages/help.tsx', help);
}

console.log("Improved font colors and injected safelist.");
