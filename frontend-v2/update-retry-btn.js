const fs = require('fs');
let code = fs.readFileSync('src/components/OfflinePage.tsx', 'utf8');

code = code.replace(
    'className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"',
    'className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 transition-all shadow-xl border border-primary/50"'
);

fs.writeFileSync('src/components/OfflinePage.tsx', code);
console.log("Updated Retry button styling");
