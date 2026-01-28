import { Router } from 'express';
import * as authController from '../controllers/controllers.auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/verify-account', authController.verifyAccount);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/login', authController.login);
// router.use('/forgot-password', /** forgotPasswordController */);
// router.use('/reset-password', /** resetPasswordController */);

export default router;
