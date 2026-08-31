const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

const regexIsMarked = /const isStreakMarkedToday = \(\) => \{[\s\S]*?return now\.toISOString\(\)\.split\('T'\)\[0\] === last\.toISOString\(\)\.split\('T'\)\[0\];\s*\};/;

const replacementIsMarked = `const isStreakMarkedToday = () => {
        if (!stats.lastStreakDate) return false;
        const now = new Date();
        const last = new Date(stats.lastStreakDate);
        return now.getFullYear() === last.getFullYear() &&
               now.getMonth() === last.getMonth() &&
               now.getDate() === last.getDate();
    };`;

code = code.replace(regexIsMarked, replacementIsMarked);

const regexHandleMark = /const res = await fetch\(\`\$\{API_URL\}\/api\/user\/streak\/mark\`, \{\s*method: "POST",\s*headers: \{ "Authorization": \`Bearer \$\{token\}\` \}\s*\}\);/;

const replacementHandleMark = `const res = await fetch(\`\${API_URL}/api/user/streak/mark\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ timezoneOffset: new Date().getTimezoneOffset() })
            });`;

code = code.replace(regexHandleMark, replacementHandleMark);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Updated progress.tsx for streak local time");
