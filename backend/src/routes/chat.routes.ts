import { Router } from 'express';
import { initiateSync, getConversations, getMessages, sendMessage, revokeMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication
router.use(authenticateToken);

// Initiate or Resume a SyncSession
router.post('/sync', initiateSync);

// Fetch all active conversations
router.get('/conversations', getConversations);

// Fetch message history for a specific swapId
router.get('/messages/:swapId', getMessages);

// Send a message (TEXT, CONTACT_SHARE, SYNC_BRIDGE)
router.post('/send', sendMessage);

// Revoke a message's PII contents
router.put('/revoke/:messageId', revokeMessage);

export default router;
