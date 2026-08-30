const fs = require('fs');

let controllerCode = fs.readFileSync('../backend/src/controllers/mentorship.controller.ts', 'utf8');

// Fix req.params.id
controllerCode = controllerCode.replace(/const swapId = req\.params\.id;/g, 'const swapId = req.params.id as string;');
controllerCode = controllerCode.replace(/const \{ id \} = req\.params;/g, 'const id = req.params.id as string;');

// Fix reduce any type and property 'classes' does not exist by casting to any
controllerCode = controllerCode.replace(
    /const m = await prisma\.mentorship\.findUnique\(\{ where: \{ id \}, include: \{ classes: true \} \}\);/g,
    'const m = await prisma.mentorship.findUnique({ where: { id }, include: { classes: true } }) as any;'
);

controllerCode = controllerCode.replace(
    /m\.classes\.reduce\(\(acc, c\) =>/g,
    'm.classes.reduce((acc: number, c: any) =>'
);

fs.writeFileSync('../backend/src/controllers/mentorship.controller.ts', controllerCode);
console.log('Fixed mentorship.controller.ts');

let routesCode = fs.readFileSync('../backend/src/routes/mentorship.routes.ts', 'utf8');

routesCode = routesCode.replace(/import \{ authenticate \} from "\.\.\/middleware\/auth\.middleware";/, 'import { authenticateToken } from "../middleware/auth.middleware";');
routesCode = routesCode.replace(/router\.use\(authenticate\);/, 'router.use(authenticateToken);');

fs.writeFileSync('../backend/src/routes/mentorship.routes.ts', routesCode);
console.log('Fixed mentorship.routes.ts');
