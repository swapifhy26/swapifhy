import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schedule a job to run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Starting chat archival job...');
    try {
        // Find date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Find all swaps where messages exist that were created more than 3 days ago
        // Actually, we want to archive older messages. 
        // We can just find all swaps, get messages older than 3 days, archive them, and delete them.
        const swaps = await prisma.swap.findMany({
            include: {
                messages: {
                    where: {
                        createdAt: {
                            lt: threeDaysAgo
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        let totalArchived = 0;

        for (const swap of swaps) {
            if (swap.messages && swap.messages.length > 0) {
                // We have messages to archive for this swap!
                
                // Get existing archived chat if any
                let existingArchived = [];
                if (swap.archivedChat) {
                    try {
                        existingArchived = JSON.parse(swap.archivedChat);
                    } catch (e) {
                        console.error("Failed to parse existing archived chat for swap", swap.id);
                    }
                }

                // Append new messages
                const newArchived = [...existingArchived, ...swap.messages];
                
                // Save to DB
                await prisma.swap.update({
                    where: { id: swap.id },
                    data: {
                        archivedChat: JSON.stringify(newArchived)
                    }
                });

                // Delete the archived messages from ChatMessage table to save space
                const messageIds = swap.messages.map(m => m.id);
                await prisma.chatMessage.deleteMany({
                    where: {
                        id: { in: messageIds }
                    }
                });

                totalArchived += messageIds.length;
                console.log(`[CRON] Archived ${messageIds.length} messages for swap ${swap.id}`);
            }
        }

        console.log(`[CRON] Chat archival job completed. Total messages archived & deleted from active table: ${totalArchived}`);
    } catch (error) {
        console.error('[CRON] Error during chat archival:', error);
    }
});
