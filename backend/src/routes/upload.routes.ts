import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadImage } from '../controllers/upload.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { UPLOADS_DIR } from '../config/env';

const router = Router();

// Multer's destination-function does NOT create the directory, and it does not
// exist in the production image — create it up front.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Specialized Multer Storage Optimization
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `identity-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit per Identity Node
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Identity Node Synchronizer: Invalid file format. Supporting JPEG, PNG, or WebP."));
    }
});

// Sync Personal Node Endpoint
router.post('/', authenticateToken as any, upload.single('image'), uploadImage as any);

export default router;
