const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

const shareBoxRegex = /<hr className="border-border\/60 my-4" \/>\s*<div className="flex items-center justify-between">\s*<div className="flex gap-2">([\s\S]*?)<\/div>\s*<motion\.button([\s\S]*?)<\/motion\.button>\s*<\/div>/;

const newLayout = `<hr className="border-border/60 my-4" />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    $1
                                </div>
                                <motion.button$2</motion.button>
                            </div>`;

if (code.match(shareBoxRegex)) {
    code = code.replace(shareBoxRegex, newLayout);
    // Add w-full sm:w-auto to motion.button
    const btnRegex = /(<motion\.button[\s\S]*?className=")(px-5)/;
    code = code.replace(btnRegex, '$1w-full sm:w-auto $2');
    
    fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
    console.log("Updated Share Skills layout");
} else {
    console.log("Could not find regex match for Share Skills box in feed.tsx");
}
