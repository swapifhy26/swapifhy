import { Router } from 'express';
import { createPost, getFeed, deletePost, updatePost, archivePost } from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/broadcast', createPost);   // Share skill-swap update
router.get('/stream', getFeed);         // Synchronize Synergy Feed
router.put('/:id', updatePost);         // Update post content
router.patch('/:id/archive', archivePost); // Archive post
router.delete('/:id', deletePost);      // Decommission post node

export default router;
