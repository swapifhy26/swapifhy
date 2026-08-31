import fs from 'fs';

let code = fs.readFileSync('backend/src/app.ts', 'utf8');

if (!code.includes('compression')) {
    code = code.replace("import helmet from 'helmet';", "import helmet from 'helmet';\nimport compression from 'compression';\nimport hpp from 'hpp';");
    code = code.replace("app.use(express.json());", "app.use(express.json());\napp.use(compression());\napp.use(hpp());");
}

fs.writeFileSync('backend/src/app.ts', code);
console.log("Injected compression and HPP middleware");
