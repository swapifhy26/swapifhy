import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const followerId = req.user?.id;
        const { followingId } = req.body;

        if (!followerId || !followingId) {
            res.status(400).json({ error: "Identity mismatch or target unspecified" });
            return;
        }

        if (followerId === followingId) {
            res.status(400).json({ error: "Self-sync not supported" });
            return;
        }

        await prisma.follow.upsert({
            where: {
                followerId_followingId: { followerId, followingId }
            },
            update: {},
            create: { followerId, followingId }
        });

        res.status(200).json({ message: "Network handshake established" });
    } catch (error) {
        console.error("Follow Error:", error);
        res.status(500).json({ error: "Failed to establish follow handshake" });
    }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const followerId = req.user?.id;
        const { followingId } = req.body;

        if (!followerId || !followingId) {
            res.status(400).json({ error: "Identity mismatch or target unspecified" });
            return;
        }

        await prisma.follow.deleteMany({
            where: { followerId, followingId }
        });

        res.status(200).json({ message: "Network connection severed" });
    } catch (error) {
        console.error("Unfollow Error:", error);
        res.status(500).json({ error: "Failed to sever follow bridge" });
    }
};

export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: true }
        });

        res.status(200).json({ followers: followers.map(f => f.follower) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch follower cloud" });
    }
};
export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: true }
        });

        res.status(200).json({ following: following.map(f => f.following) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch following cloud" });
    }
};

export const getFollowStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const rawUserId = req.params.userId || req.user?.id;
        const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
        
        if (!userId) {
            res.status(400).json({ error: "Target identity unspecified" });
            return;
        }

        const [followerCount, followingCount] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } })
        ]);

        res.status(200).json({ followerCount, followingCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate network telemetry" });
    }
};
