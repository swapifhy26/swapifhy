const fs = require('fs');

const pages = ['src/pages/explore.tsx', 'src/pages/progress.tsx', 'src/pages/feed.tsx'];

pages.forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/text-4xl md:text-5xl/g, 'text-3xl sm:text-4xl md:text-5xl');
        code = code.replace(/text-5xl md:text-6xl/g, 'text-4xl sm:text-5xl md:text-6xl');
        fs.writeFileSync(file, code);
        console.log('Beautified ' + file);
    }
});
