const fs = require('fs');
['feed.tsx', 'network.tsx', 'progress.tsx', 'settings.tsx', 'matches.tsx', 'explore.tsx', 'dashboard.tsx'].forEach(file => {
    let code = fs.readFileSync('src/pages/' + file, 'utf8');
    
    // Replace hardcoded pb-24 or pb-40 with pb-36 md:pb-24 to ensure bottom nav clearance
    code = code.replace(/pb-24/g, 'pb-36 md:pb-24');
    code = code.replace(/pb-40/g, 'pb-36 md:pb-40');
    
    // For explore.tsx and dashboard.tsx which might lack pb
    if (file === 'explore.tsx' || file === 'dashboard.tsx') {
        if (!code.includes('pb-36')) {
            code = code.replace(/className="w-full min-h-screen bg-background relative overflow-hidden"/g, 'className="w-full min-h-screen bg-background relative overflow-hidden pb-36 md:pb-24"');
        }
    }
    // For matches.tsx
    if (file === 'matches.tsx') {
        if (!code.includes('pb-36')) {
            code = code.replace(/className="w-full min-h-screen bg-background relative overflow-hidden flex flex-col p-6 pt-32"/g, 'className="w-full min-h-screen bg-background relative overflow-hidden flex flex-col p-6 pt-32 pb-36 md:pb-24"');
        }
    }

    fs.writeFileSync('src/pages/' + file, code);
});
console.log('Padding adjusted on all main pages!');
