import { Router } from 'express';
import { login, logout, register, me, inicio, protegido } from '../controller/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/requireAuth.middleware.js';
import { registerSchema, loginSchema, logoutSchema } from '../validations/inputs/user.schema.js';

const router = Router();

router.route('/register').post(validate(registerSchema), register);
router.route('/login').post(validate(loginSchema), login);
router.route('/logout').post(validate(logoutSchema), logout);

// Sesión actual: exige cookie válida. Sin ella → 401 (no es error, es "anónimo").
router.route('/me').get(requireAuth, me);

export default router;
