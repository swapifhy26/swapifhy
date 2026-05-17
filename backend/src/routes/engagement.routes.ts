import { Router } from 'express';
import { toggleLike, addComment, getComments } from '../controllers/engagement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/handshake', toggleLike);      // Toggle professional like
router.post('/like', toggleLike);           // Frontend-specific alias
router.delete('/like', toggleLike);         // Frontend-specific alias
router.post('/comment', addComment);        // Attach comment node
router.get('/comments/:postId', getComments); // Fetch comment stream

export default router;
