import { Router } from 'express';
import { changePassword, login, me } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, login);
authRouter.get('/me', authenticateToken, me);
authRouter.post('/change-password', authenticateToken, changePassword);
