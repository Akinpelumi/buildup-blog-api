import { Router } from 'express';
import * as authController from '../controllers/controllers.auth.js';

const router = Router();

router.use('/register', authController.register);
router.use('/verify-account', authController.verifyAccount);
router.use('/resend-verification-code', authController.resendVerificationCode);
router.use('/login', authController.login);
// router.use('/forgot-password', /** forgotPasswordController */);
// router.use('/reset-password', /** resetPasswordController */);

export default router;
