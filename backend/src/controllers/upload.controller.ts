import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const uploadImage = (req: AuthRequest, res: Response): void => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No identity node detected for synchronization." });
            return;
        }

        // The file is already saved by multer
        // We return the public URL path
        // Note: In production, you would point this to your static domain
        const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
        const filePath = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ 
            message: "Identity node synchronized.",
            url: API_URL ? `${API_URL}${filePath}` : filePath 
        });
    } catch (error) {
        res.status(500).json({ error: "Internal processing error during sync." });
    }
};
