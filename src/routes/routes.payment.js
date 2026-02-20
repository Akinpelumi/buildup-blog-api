import { Router } from 'express';
import * as paymentController from '../controllers/controllers.payment.js';
import * as authMiddleware from '../middlewares/middlewares.auth.js';

const router = Router();

router.post('/initiate-payment', authMiddleware.verifyToken, paymentController.initiatePayment);
router.get('/verify-payment', authMiddleware.verifyToken, paymentController.verifyPayment);
// router.post('/process-webhook', paymentController.verifyAccount);

export default router;
