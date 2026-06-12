import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import matchRoutes from './routes/match.routes';
import chatRoutes from './routes/chat.routes';
import followRoutes from './routes/follow.routes';
import postRoutes from './routes/post.routes';
import engagementRoutes from './routes/engagement.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { UPLOADS_DIR } from './config/env';

const app = express();

// Render/Cloud Run sit behind one proxy hop; required for express-rate-limit
// to see real client IPs instead of the proxy's.
app.set('trust proxy', 1);

// CORS is pinned to known frontend origins. Without FRONTEND_URL the cors()
// default is '*', so refuse to start in production rather than silently un-pin.
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    throw new Error('FATAL: FRONTEND_URL is not defined. Set it to a comma-separated list of allowed origins.');
}
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Too many requests, sync failed." }
});
app.use('/api/', limiter);

// Much stricter limit on credential endpoints (login/register brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many attempts, please try again later." }
});
app.use('/api/auth', authLimiter);

// Global Middlewares
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Swapifhy MVP API is running locally (TypeScript)' });
});

// Swagger API Documentation Endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // User & Profile management
app.use('/api/match', matchRoutes); // Matchmaking queries
app.use('/api/chat', chatRoutes); // Chat & Sync Protocol
app.use('/api/follow', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/upload', uploadRoutes); // Identity Node Upload
app.use('/api/admin', adminRoutes);   // Admin Command Center

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
