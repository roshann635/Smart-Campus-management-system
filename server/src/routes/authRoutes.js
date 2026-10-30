import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { loginSchema } from '../validators/authValidator.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.get('/csrf-token', AuthController.getCsrfToken);

export default router;

