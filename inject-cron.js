const fs = require('fs');

let code = fs.readFileSync('backend/src/main.ts', 'utf8');

if (!code.includes("import './cron/archiveChats'")) {
    code = code.replace(
        /import app from '\.\/app';/,
        `import app from './app';\nimport './cron/archiveChats'; // Initialize chat archival cron job`
    );
    fs.writeFileSync('backend/src/main.ts', code);
    console.log("Injected cron import");
}
