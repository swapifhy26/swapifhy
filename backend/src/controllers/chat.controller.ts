import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// ── In-memory presence store (resets on server restart, fine for MVP) ──
const onlineUsers = new Map<string, number>(); // userId → last heartbeat timestamp

export const heartbeat = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    onlineUsers.set(userId, Date.now());
    res.status(200).json({ ok: true });
};

export const getPresence = async (req: AuthRequest, res: Response): Promise<void> => {
    const { userIds } = req.body; // array of userIds to check
    if (!Array.isArray(userIds)) { res.status(400).json({ error: "userIds required" }); return; }
    const now = Date.now();
    const presence: Record<string, boolean> = {};
    userIds.forEach((id: string) => {
        const last = onlineUsers.get(id);
        presence[id] = last !== undefined && (now - last) < 35000; // 35s threshold
    });
    res.status(200).json({ presence });
};

export const initiateSync = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const proposerId = req.user?.id;
        const { receiverId } = req.body;
        if (!proposerId || !receiverId) { res.status(400).json({ error: "Participants not identified" }); return; }

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
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: "SYSTEM",
                    content: "Swap started! You can now message and share contact info.",
                    type: "TEXT"
                }
            });
        }

        res.status(200).json({ swapId: swap.id });
    } catch (error) {
        res.status(500).json({ error: "Failed to initiate sync" });
    }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const swaps = await prisma.swap.findMany({
            where: { OR: [{ proposerId: userId }, { receiverId: userId }] },
            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const now = Date.now();
        const formattedConversations = swaps.map(s => {
            const partner = s.proposerId === userId ? s.receiver : s.proposer;
            const last = onlineUsers.get(partner.id);
            const isOnline = last !== undefined && (now - last) < 35000;
            return {
                swapId: s.id,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerAvatar: partner.avatarUrl,
                lastMessage: s.messages[0]?.content || "No messages yet",
                status: s.status,
                updatedAt: s.updatedAt,
                isOnline
            };
        });

        res.status(200).json({ conversations: formattedConversations });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const swapId = req.params.swapId as string;
        const userId = req.user?.id;
        if (!swapId || !userId) { res.status(400).json({ error: "Invalid request" }); return; }

        const swap = await prisma.swap.findUnique({
            where: { id: swapId },
            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true, bio: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } }
            }
        });

        if (!swap) { res.status(404).json({ error: "Swap not found" }); return; }
        if (swap.proposerId !== userId && swap.receiverId !== userId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }

        const messages = await prisma.chatMessage.findMany({
            where: { swapId },
            orderBy: { createdAt: 'asc' }
        });

        const partner = swap.proposerId === userId ? swap.receiver : swap.proposer;
        const now = Date.now();
        const last = onlineUsers.get(partner.id);
        const isOnline = last !== undefined && (now - last) < 35000;

        const scrubbedMessages = messages.map(msg => {
            if (msg.isRevoked) {
                return { ...msg, details: null, content: "Contact info removed." };
            }
            // ✅ Parse details if it's a JSON string
            let parsedDetails = msg.details;
            try {
                if (typeof msg.details === 'string') parsedDetails = JSON.parse(msg.details);
            } catch { /* leave as-is */ }
            return { ...msg, details: parsedDetails };
        });

        res.status(200).json({ messages: scrubbedMessages, partner: { ...partner, isOnline } });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const { swapId, content, type, details } = req.body;
        if (!senderId || !swapId) { res.status(400).json({ error: "Missing parameters" }); return; }

        const swap = await prisma.swap.findUnique({ where: { id: swapId } });
        if (!swap) { res.status(404).json({ error: "Swap not found" }); return; }
        if (swap.proposerId !== senderId && swap.receiverId !== senderId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }

        const message = await prisma.chatMessage.create({
            data: {
                swapId,
                senderId,
                content: content || (type === "CONTACT_SHARE" ? "Contact info shared" : "Link shared"),
                type: type || "TEXT",
                // ✅ Always store details as JSON string
                details: details ? JSON.stringify(details) : undefined
            }
        });

        await prisma.swap.update({ where: { id: swapId }, data: { updatedAt: new Date() } });
        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const revokeMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const messageId = req.params.messageId;
        if (!senderId || !messageId) { res.status(400).json({ error: "Invalid request" }); return; }

        const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
        if (!message || message.senderId !== senderId) {
            res.status(403).json({ error: "Unauthorized" }); return;
        }

        await prisma.chatMessage.update({
            where: { id: messageId },
            // ✅ Use null not undefined — Prisma requires null to clear a field
            data: { isRevoked: true, details: null }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to revoke message" });
    }
};
