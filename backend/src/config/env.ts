import * as dotenv from 'dotenv';
import path from 'path';

// Loaded here (not only in main.ts) because module imports are hoisted —
// consumers of this config may be evaluated before main.ts runs dotenv.config().
dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('FATAL: JWT_SECRET is not defined. Set it in the environment before starting the server.');
}

export const JWT_SECRET: string = secret;

// Single source of truth for the uploads directory, shared by multer (write)
// and express.static (read). Resolves to <backend root>/uploads in both the
// dev (src/) and compiled (dist/) layouts.
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');
