import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

const router = Router();

const sendOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

router.post('/send-otp', authLimiter, validate(sendOTPSchema), AuthController.sendOTP);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), AuthController.verifyOTP);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/session', authMiddleware, AuthController.getSession);

export default router;
