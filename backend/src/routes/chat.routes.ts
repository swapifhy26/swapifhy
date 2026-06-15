import { Router } from 'express';
import { 
    initiateSync, getConversations, getMessages, 
    sendMessage, revokeMessage, heartbeat, getPresence 
} from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.post('/sync', initiateSync);
router.get('/conversations', getConversations);
router.get('/messages/:swapId', getMessages);
router.post('/send', sendMessage);
router.put('/revoke/:messageId', revokeMessage);

// ✅ Presence
router.post('/heartbeat', heartbeat);
router.post('/presence', getPresence);

export default router;
