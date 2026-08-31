import fs from 'fs';

let code = fs.readFileSync('backend/src/app.ts', 'utf8');

if (!code.includes('xssSanitizer')) {
    code = code.replace("import hpp from 'hpp';", "import hpp from 'hpp';\nimport { xssSanitizer } from './middleware/xss';");
    code = code.replace("app.use(hpp());", "app.use(hpp());\napp.use(xssSanitizer);");
}

fs.writeFileSync('backend/src/app.ts', code);
console.log("Injected XSS sanitization middleware");
