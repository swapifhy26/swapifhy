const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

code = code.replace(
    'import { motion } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";'
);

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Added AnimatePresence import");
