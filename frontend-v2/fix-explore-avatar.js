const fs = require('fs');
let code = fs.readFileSync('src/pages/explore.tsx', 'utf8');

// Fix the avatar div
const brokenAvatar = '<div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem]-4 md:mb-6 overflow-hidden transform group-hover:rotate-3 transition-transform">';
const fixedAvatar = '<div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-border flex items-center justify-center shadow-inner mb-4 md:mb-6 overflow-hidden transform group-hover:rotate-3 transition-transform">';

if (code.includes(brokenAvatar)) {
    code = code.replace(brokenAvatar, fixedAvatar);
    fs.writeFileSync('src/pages/explore.tsx', code);
    console.log('Fixed broken avatar class');
} else {
    console.log('Broken avatar not found');
}
