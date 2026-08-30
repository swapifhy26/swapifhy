const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

// Fix stats grid
code = code.replace(/className="grid grid-cols-2 lg:grid-cols-4 gap-6"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"');

// Fix class tracking grid
code = code.replace(/className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10"/g, 'className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 relative z-10"');

// Reduce target hours padding on mobile
code = code.replace(/className="p-4 bg-surface\/50 rounded-2xl border border-border\/40"/g, 'className="p-3 sm:p-4 bg-surface/50 rounded-2xl border border-border/40"');

fs.writeFileSync('src/pages/progress.tsx', code);
console.log('Beautified progress grids');
