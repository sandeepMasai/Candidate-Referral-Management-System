import { Router } from 'express';
import {
  forgotPassword,
  getCurrentUser,
  login,
  register,
  resetPassword,
} from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  forgotPasswordValidators,
  loginValidators,
  registerValidators,
  resetPasswordValidators,
} from '../utils/validators.js';

const router = Router();

router.post('/register', registerValidators, validateRequest, register);
router.post('/login', loginValidators, validateRequest, login);
router.post('/forgot-password', forgotPasswordValidators, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidators, validateRequest, resetPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;

