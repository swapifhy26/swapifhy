const fs = require('fs');
let code = fs.readFileSync('src/controllers/chat.controller.ts', 'utf8');

const badWordsRegex = 'const BANNED_WORDS = ["porn", "sex", "nude", "nudes", "dick", "pussy", "whore", "slut", "bitch"];';
const filterLogic = `
        if (type === "TEXT" && content) {
            const lowerContent = content.toLowerCase();
            const containsBanned = BANNED_WORDS.some(word => lowerContent.includes(word));
            
            if (containsBanned) {
                // Send a system warning to the user instead
                await prisma.chatMessage.create({
                    data: {
                        swapId,
                        senderId: "SYSTEM",
                        content: "⚠️ WARNING: Your message violated our safety policy. All chats are recorded. Strict action and reporting to authorities will occur for harassment or explicit content.",
                        type: "TEXT"
                    }
                });
                res.status(400).json({ error: "Message violates safety policy." });
                return;
            }
        }
`;

if (!code.includes('const BANNED_WORDS')) {
    // Inject BANNED_WORDS at top of file
    code = code.replace(/import { PrismaClient } from '@prisma\/client';/, "import { PrismaClient } from '@prisma/client';\n\n" + badWordsRegex);
    
    // Inject filter logic in sendMessage
    const sendMsgStart = `export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const { swapId, content, type, details } = req.body;
        if (!senderId || !swapId) { res.status(400).json({ error: "Missing parameters" }); return; }

        const swap = await prisma.swap.findUnique({ where: { id: swapId } });
        if (!swap) { res.status(404).json({ error: "Swap not found" }); return; }
        if (swap.proposerId !== senderId && swap.receiverId !== senderId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }`;
        
    code = code.replace(sendMsgStart, sendMsgStart + filterLogic);
    
    // Update the initial Swap Started message
    const oldWelcomeMsg = 'content: "Swap started! You can now message and share contact info.",';
    const newWelcomeMsg = 'content: "Swap started! You can now message and share contact info. Please note: Every message is recorded. Chat appropriately. Violations hindering women\'s safety will be reported to authorities.",';
    code = code.replace(oldWelcomeMsg, newWelcomeMsg);
    
    fs.writeFileSync('src/controllers/chat.controller.ts', code);
    console.log('Successfully injected chat safety filters and welcome message');
} else {
    console.log('Safety logic already exists');
}
