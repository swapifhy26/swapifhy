import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request to hold our User Payload
export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
    }

    try {
        if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET must be set in production');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_only_for_local_dev');
        req.user = decoded as { id: string; email: string };
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
};
