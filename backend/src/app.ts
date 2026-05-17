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
import path from 'path';

import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';

const app = express();

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000,
    message: { error: "Too many requests, sync failed." }
});
app.use('/api/', limiter);

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
