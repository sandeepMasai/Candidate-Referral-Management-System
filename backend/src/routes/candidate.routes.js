import { Router } from 'express';
import { param } from 'express-validator';
import multer from 'multer';
import {
  createCandidate,
  deleteCandidate,
  getCandidates,
  getMetrics,
  updateCandidateStatus,
} from '../controllers/candidate.controller.js';
import upload from '../config/cloudinary.js';
import validateRequest from '../middleware/validateRequest.js';
import { createCandidateValidators, statusUpdateValidators } from '../utils/validators.js';
import authenticate from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.use(authenticate);

router.get('/', getCandidates);
router.get('/metrics', getMetrics);

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size exceeds the maximum allowed (5MB).',
      });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field. Only "resume" field is allowed.',
      });
    }
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
    });
  }
  if (err) {
    console.error('File filter error:', err);
    return res.status(400).json({
      message: err.message || 'File upload error. Only PDF files are allowed.',
    });
  }
  next();
};

router.post(
  '/',
  upload.single('resume'), // Multer middleware - handles file upload (memory storage)
  handleMulterError, // Handle multer errors (file size, type, etc.)
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

