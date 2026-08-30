import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const BANNED_WORDS = ["porn", "sex", "nude", "nudes", "dick", "pussy", "whore", "slut", "bitch"];
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

        // Enforce max 5 pending sent requests limit
        const pendingSent = await prisma.swap.count({
            where: { proposerId, status: "PENDING" }
        });
        
        let swap = await prisma.swap.findFirst({
            where: {
                OR: [
                    { proposerId, receiverId },
                    { proposerId: receiverId, receiverId: proposerId }
                ]
            }
        });
        
        if (!swap && pendingSent >= 5) {
            res.status(400).json({ error: "You can only have up to 5 pending sent swap requests at a time." });
            return;
        }

        if (!swap) {
            swap = await prisma.swap.create({
                data: { proposerId, receiverId, status: "PENDING" }
            });
            await prisma.chatMessage.create({
                data: {
                    swapId: swap.id,
                    senderId: "SYSTEM",
                    content: "Swap started! You can now message and share contact info. Please note: Every message is recorded. Chat appropriately. Violations hindering women's safety will be reported to authorities.",
                    type: "TEXT"
                }
            });
            // Notify receiver about the new swap request
            await prisma.notification.create({
                data: {
                    userId: receiverId,
                    title: "New Swap Request",
                    message: `You have a new swap request!`,
                    type: "SWAP_REQUEST",
                    link: "/explore"
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
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: {
                    select: {
                        messages: { where: { senderId: { not: userId }, isRead: false } }
                    }
                }
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
                isOnline,
                isProposer: s.proposerId === userId,
                unreadCount: s._count?.messages || 0
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

        // Mark unread messages from the partner as read
        await prisma.chatMessage.updateMany({
            where: { swapId, senderId: { not: userId }, isRead: false },
            data: { isRead: true }
        });

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

        res.status(200).json({ messages: scrubbedMessages, partner: { ...partner, isOnline }, status: swap.status, isProposer: swap.proposerId === userId });
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
        // Notify the partner about the new message
        if (type !== "SYSTEM") {
            const partnerId = swap.proposerId === senderId ? swap.receiverId : swap.proposerId;
            
            // Just push a new notification
            await prisma.notification.create({
                data: {
                    userId: partnerId,
                    title: "New Message",
                    message: `You received a new message.`,
                    type: "NEW_MESSAGE",
                    link: "/explore"
                }
            });
        }

        await prisma.swap.update({ where: { id: swapId }, data: { updatedAt: new Date() } });
        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const revokeMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const messageId = req.params.messageId as string;
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
