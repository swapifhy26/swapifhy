import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { content, type } = req.body;

        if (!userId || !content) {
            res.status(400).json({ error: "Identity mismatch or empty broadcast content" });
            return;
        }

        const post = await prisma.post.create({
            data: { userId, content, type: type || "UPDATE" },
            include: { user: true }
        });

        res.status(201).json(post);
    } catch (error) {
        console.error("Post Creation Error:", error);
        res.status(500).json({ error: "Failed to broadcast synergy update" });
    }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Professional Feed Stratum (Synergy-Aware Filtering)
        const posts: any = await prisma.post.findMany({
            where: { isArchived: false } as any,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        bio: true,
                        reputation: true,
                        skillsTeaching: { include: { skill: true } },
                        skillsLearning: { include: { skill: true } }
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatarUrl: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { comments: true, likes: true } }
            }
        });

        // Add 'isLiked' metadata
        const feedWithMeta = posts.map((post: any) => ({
            ...post,
            isLiked: post.likes.some((like: any) => like.userId === userId)
        }));

        res.status(200).json(feedWithMeta);
    } catch (error) {
        console.error("Feed Fetch Error:", error);
        res.status(500).json({ error: "Failed to synchronize Synergy Feed" });
    }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;
        const { content, type } = req.body;

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post || post.userId !== userId) {
            res.status(403).json({ error: "Access denied or post not found" });
            return;
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { content, type: type || post.type },
            include: { user: true }
        });

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: "Failed to update broadcast" });
    }
};

export const archivePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post || post.userId !== userId) {
            res.status(403).json({ error: "Access denied or post not found" });
            return;
        }

        await prisma.post.update({
            where: { id },
            data: { isArchived: true } as any
        });

        res.status(200).json({ message: "Synergy post archived permanently" });
    } catch (error) {
        res.status(500).json({ error: "Failed to archive post" });
    }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post || post.userId !== userId) {
            res.status(403).json({ error: "Access denied or post not found" });
            return;
        }

        await prisma.post.delete({ where: { id } });
        res.status(200).json({ message: "Synergy post decommissioned" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete post" });
    }
};
