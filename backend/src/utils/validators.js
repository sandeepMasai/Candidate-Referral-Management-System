import { body, param } from 'express-validator';
import { CANDIDATE_STATUSES } from '../models/Candidate.js';
import { USER_ROLES } from '../models/User.js';

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

export const createCandidateValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .matches(phoneRegex)
    .withMessage('Phone must be a valid number (7-20 digits)'),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
];

export const statusUpdateValidators = [
  param('id').isMongoId().withMessage('Invalid candidate id'),
  body('status')
    .isIn(CANDIDATE_STATUSES)
    .withMessage(`Status must be one of: ${CANDIDATE_STATUSES.join(', ')}`),
];

export const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage(`Role must be one of: ${USER_ROLES.join(', ')}`),
];

export const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export const profileValidators = [
  body('headline').optional().isLength({ max: 120 }).withMessage('Headline is too long'),
  body('phone')
    .optional()
    .matches(phoneRegex)
    .withMessage('Phone must be a valid number (7-20 digits)'),
  body('location').optional().isLength({ max: 120 }).withMessage('Location is too long'),
  body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
  body('bio').optional().isLength({ max: 2000 }).withMessage('Bio is too long'),
];

