const fs = require('fs');

const files = [
    'src/components/Layout.tsx',
    'src/pages/explore.tsx',
    'src/pages/feed.tsx',
    'src/pages/matches.tsx',
    'src/pages/network.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/currentUserId=\{[a-zA-Z0-9_]+\}\s*/g, '');
        fs.writeFileSync(file, code);
        console.log('Stripped prop from ' + file);
    }
});
