const fs = require('fs');

const pages = ['src/pages/explore.tsx', 'src/pages/progress.tsx'];

pages.forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/px-6/g, 'px-4 md:px-6');
        fs.writeFileSync(file, code);
        console.log('Beautified padding in ' + file);
    }
});
