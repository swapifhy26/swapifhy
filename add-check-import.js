const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

if (!code.includes('Check,')) {
    code = code.replace(
        /User, Zap, MessageSquare, Github, Linkedin, Instagram,/,
        'User, Zap, MessageSquare, Github, Linkedin, Instagram, Check,'
    );
    fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
    console.log("Added Check import to explore.tsx");
} else {
    console.log("Check already imported.");
}
