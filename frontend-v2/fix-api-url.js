const fs = require('fs');
let code = fs.readFileSync('src/pages/index.tsx', 'utf8');

const targetUrl = `const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/inquiries\``;
const newUrl = `const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
                                                const res = await fetch(\`\${baseUrl}/api/auth/inquiries\``;

if (code.includes(targetUrl)) {
    code = code.replace(targetUrl, newUrl);
    fs.writeFileSync('src/pages/index.tsx', code);
    console.log('Fixed API URL fallback in index.tsx');
} else {
    console.log('Target URL not found');
}
