import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);
router.post('/:id/read', authenticate, markNotificationRead);
router.post('/read-all', authenticate, markAllNotificationsRead);

export default router;
