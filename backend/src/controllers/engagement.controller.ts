import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { postId } = req.body;

        if (!userId || !postId) {
            res.status(400).json({ error: "Identity mismatch or target post unspecified" });
            return;
        }

        // Validate Post existence
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            res.status(404).json({ error: "Target broadcast node not found in current stream" });
            return;
        }

        // Validate User existence
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(403).json({ error: "Identity verification failed. Account de-synced." });
            return;
        }

        const existingLike = await prisma.like.findUnique({
            where: { postId_userId: { postId, userId } }
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            res.status(200).json({ message: "Handshake retracted", liked: false });
        } else {
            await prisma.like.create({ data: { postId, userId } });
            res.status(200).json({ message: "Handshake established", liked: true });
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002: Unique constraint failed (e.g. double-click race condition)
            if (error.code === 'P2002') {
                // If it already exists, just return success with liked: true
                res.status(200).json({ message: "Handshake already synchronized", liked: true });
                return;
            }
            // P2003: Foreign key constraint failed
            if (error.code === 'P2003') {
                res.status(404).json({ error: "Target node or identity reference mismatch" });
                return;
            }
        }
        
        console.error("[ENGAGEMENT] Critical Failure:", error);
        res.status(500).json({ 
            error: "Failed to process engagement handshake", 
            details: error instanceof Error ? error.message : "Handshake internal collision" 
        });
    }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { postId, content } = req.body;

        if (!userId || !postId || !content) {
            res.status(400).json({ error: "Empty comment or unspecified target post" });
            return;
        }

        const comment = await prisma.comment.create({
            data: { postId, userId, content },
            include: { user: true }
        });

        res.status(201).json(comment);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2003: Foreign key constraint failed
            if (error.code === 'P2003') {
                res.status(404).json({ error: "Target broadcast node or identity reference mismatch" });
                return;
            }
        }
        console.error("[ENGAGEMENT] Comment Failure:", error);
        res.status(500).json({ error: "Failed to attach comment node" });
    }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const postId = req.params.postId as string;
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comment stream" });
    }
};
