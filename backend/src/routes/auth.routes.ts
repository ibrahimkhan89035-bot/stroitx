import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup/homeowner', authCtrl.registerHomeowner);
router.post('/signup/professional', authCtrl.registerProfessional);
router.post('/login', authCtrl.login);
router.post('/send-otp', authCtrl.requestOtp);
router.post('/verify-otp', authCtrl.verifyOtp);
router.post('/otp/request', authCtrl.requestOtp);
router.post('/otp/verify', authCtrl.verifyOtp);
router.get('/email/verify', authCtrl.verifyEmail);
router.get('/me', authenticate, authCtrl.getMe);
router.patch('/profile', authenticate, authCtrl.updateProfile);
router.put('/profile', authenticate, authCtrl.updateProfile);
router.patch('/language', authenticate, authCtrl.updateLanguage);
router.patch('/theme', authenticate, authCtrl.updateTheme);
router.patch('/password', authenticate, authCtrl.updatePassword);
router.post('/support', authenticate, authCtrl.submitSupportTicket);
router.post('/deactivate', authenticate, authCtrl.deactivateAccount);
router.delete('/account', authenticate, authCtrl.deleteAccount);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/logout', authenticate, authCtrl.logout);

export default router;
