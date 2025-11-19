import { Router } from 'express';
import { param } from 'express-validator';
import {
  createCandidate,
  deleteCandidate,
  getCandidates,
  getMetrics,
  updateCandidateStatus,
} from '../controllers/candidate.controller.js';
import upload from '../middleware/upload.js';
import validateRequest from '../middleware/validateRequest.js';
import { createCandidateValidators, statusUpdateValidators } from '../utils/validators.js';
import authenticate from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.use(authenticate);

router.get('/', getCandidates);
router.get('/metrics', getMetrics);

router.post(
  '/',
  upload.single('resume'),
  createCandidateValidators,
  validateRequest,
  createCandidate
);

router.put(
  '/:id/status',
  requireRole('admin'),
  statusUpdateValidators,
  validateRequest,
  updateCandidateStatus
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isMongoId().withMessage('Invalid candidate id')],
  validateRequest,
  deleteCandidate
);

export default router;

