import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import professionalRoutes from './professional.routes';
import quoteRoutes from './quote.routes';
import paymentRoutes from './payment.routes';
import subscriptionRoutes from './subscription.routes';
import notificationRoutes from './notification.routes';
import verificationRoutes from './verification.routes';
import messageRoutes from './message.routes';
import adminRoutes from './admin.routes';
import chatRoutes from './chat.routes';
import * as authCtrl from '../controllers/auth.controller';

const router = Router();

// Root auth endpoints
router.post('/send-otp', authCtrl.requestOtp);
router.post('/verify-otp', authCtrl.verifyOtp);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);

// Active, completed routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/professionals', professionalRoutes);
router.use('/quotes', quoteRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment', paymentRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/verification', verificationRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

export default router;