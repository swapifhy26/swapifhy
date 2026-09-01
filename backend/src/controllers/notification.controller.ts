import prisma from '../prisma';
import { Request, Response } from 'express';




interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const id = req.params.id as string;

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Mark Notification Read Error:", error);
        res.status(500).json({ error: "Failed to mark as read" });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ error: "Failed to mark all as read" });
    }
};
