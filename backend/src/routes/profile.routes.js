import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profile.controller.js';
import authenticate from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { profileValidators } from '../utils/validators.js';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.post('/', profileValidators, validateRequest, upsertProfile);

export default router;

