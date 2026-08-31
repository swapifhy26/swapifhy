const fs = require('fs');

// 1. Add submitTicket to user.controller.ts
let userController = fs.readFileSync('backend/src/controllers/user.controller.ts', 'utf8');

const submitTicketCode = `
export const submitTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { ticketId, type, category, content } = req.body;

        const ticket = await prisma.supportTicket.create({
            data: {
                ticketId,
                type,
                category,
                content,
                userId: userId || null
            }
        });

        res.status(201).json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create ticket" });
    }
};
`;

userController += submitTicketCode;
fs.writeFileSync('backend/src/controllers/user.controller.ts', userController);

// 2. Add route to user.routes.ts
let userRoutes = fs.readFileSync('backend/src/routes/user.routes.ts', 'utf8');
userRoutes = userRoutes.replace(
    /import \{ getProfile, updateProfile, changePassword, markStreak \} from '\.\.\/controllers\/user\.controller';/,
    "import { getProfile, updateProfile, changePassword, markStreak, submitTicket } from '../controllers/user.controller';"
);
userRoutes = userRoutes.replace(
    /router\.post\('\/streak\/mark', markStreak\);/,
    "router.post('/streak/mark', markStreak);\nrouter.post('/ticket', submitTicket);"
);
fs.writeFileSync('backend/src/routes/user.routes.ts', userRoutes);

console.log("Added submitTicket endpoint to user.controller.ts and user.routes.ts");
