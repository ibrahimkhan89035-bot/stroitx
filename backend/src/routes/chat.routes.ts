import express from 'express';
import * as chatCtrl from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticate);

// Chat Routes
router.post('/session', chatCtrl.getOrCreateSession);
router.get('/messages/:sessionId', chatCtrl.getSessionMessages);
router.post('/messages', chatCtrl.sendChatMessage);
router.get('/admin/sessions', chatCtrl.getAdminLiveChats);
router.get('/admin/search', chatCtrl.searchUserSession);

// This default export is required to prevent the "got an Object" error in index.ts
export default router;