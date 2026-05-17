import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Initiate a Sync Session (Create a Swap and initial message)
 */
export const initiateSync = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const proposerId = req.user?.id;
        const { receiverId } = req.body;

        if (!proposerId || !receiverId) {
            res.status(400).json({ error: "Participants not identified" });
            return;
        }

        // 1. Check if a swap already exists between these two
        let swap = await prisma.swap.findFirst({
            where: {
                OR: [
                    { proposerId, receiverId },
                    { proposerId: receiverId, receiverId: proposerId }
                ]
            }
        });

        if (!swap) {
            swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING" }
            });

            // Initial System Message
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: "SYSTEM",
                    content: "Swap started! You can now share contact info.",
                    type: "TEXT"
                }
            });
        }

        res.status(200).json({ swapId: swap.id });
    } catch (error) {
        res.status(500).json({ error: "Failed to initiate sync bridge" });
    }
};

/**
 * Get all active conversations (Swaps) for the current user
 */
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const swaps = await prisma.swap.findMany({
            where: {
                OR: [{ proposerId: userId }, { receiverId: userId }]
            },
            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const formattedConversations = swaps.map(s => {
            const partner = s.proposerId === userId ? s.receiver : s.proposer;
            return {
                swapId: s.id,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerAvatar: partner.avatarUrl,
                lastMessage: s.messages[0]?.content || "No messages yet",
                status: s.status,
                updatedAt: s.updatedAt
            };
        });

        res.status(200).json({ conversations: formattedConversations });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

/**
 * Get message history for a specific swap session
 */
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const swapId = req.params.swapId as string;
        const userId = req.user?.id;

        if (!swapId || !userId) {
            res.status(400).json({ error: "Invalid request" });
            return;
        }

        const messages = await prisma.chatMessage.findMany({
            where: { swapId },
            orderBy: { createdAt: 'asc' }
        });

        // 2. Fetch Swap to identify context/partner
        const swap = await prisma.swap.findUnique({
            where: { id: swapId },
            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true, bio: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } }
            }
        }) as any;

        const partner = swap?.proposerId === userId ? swap?.receiver : swap?.proposer;

        // 3. Scrubbed messages logic (PII protection)
        const scrubbedMessages = messages.map(msg => {
            if (msg.isRevoked) {
                return { ...msg, details: null, content: "Contact info removed." };
            }
            return msg;
        });

        res.status(200).json({ messages: scrubbedMessages, partner });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch message history" });
    }
};

/**
 * Send a message (Text, Contact Card, or Sync Bridge)
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const { swapId, content, type, details } = req.body;

        if (!senderId || !swapId) {
            res.status(400).json({ error: "Identify mission parameters" });
            return;
        }

        const message = await prisma.chatMessage.create({
            data: {
                swapId: swapId as string,
                senderId,
                content: content || (type === "CONTACT_SHARE" ? "Contact info shared" : "Link shared"),
                type: type || "TEXT",
                details: details || undefined
            }
        });

        // Update the Swap timestamp
        await prisma.swap.update({
            where: { id: swapId as string },
            data: { updatedAt: new Date() }
        });

        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: "Failed to beam message" });
    }
};

/**
 * Revoke a specialized message (Contact Share or Sync Bridge)
 */
export const revokeMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const messageId = req.params.messageId as string;

        if (!senderId || !messageId) {
            res.status(400).json({ error: "Invalid revocation request" });
            return;
        }

        const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
        
        if (!message || message.senderId !== senderId) {
            res.status(403).json({ error: "Revocation unauthorized" });
            return;
        }

        await prisma.chatMessage.update({
            where: { id: messageId },
            data: { isRevoked: true, details: undefined }
        });

        res.status(200).json({ success: true, message: "Message info removed." });
    } catch (error) {
        res.status(500).json({ error: "Revocation logic failure" });
    }
};
