import { Router } from 'express';
import * as msgCtrl from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/conversations', msgCtrl.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', msgCtrl.getMessages);
router.post('/conversations/:conversationId/close', msgCtrl.closeConversation);
router.post('/conversations/:conversationId/resume', msgCtrl.resumeConversation);
router.post('/messages', msgCtrl.sendMessage);
router.get('/conversations', msgCtrl.getUserConversations);

export default router;
