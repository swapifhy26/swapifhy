const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

const targetImport = `import Head from "next/head";`;
const newImport = `import Head from "next/head";\nimport { motion, AnimatePresence } from "framer-motion";`;

if (code.includes(targetImport)) {
    code = code.replace(targetImport, newImport);
    fs.writeFileSync('src/pages/admin/index.tsx', code);
    console.log('Added framer-motion imports');
} else {
    console.log('Could not find target import');
}
