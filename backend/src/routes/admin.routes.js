import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminStats,
} from '../controllers/admin.controller.js';
import authenticate from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import validateRequest from '../middleware/validateRequest.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);

router.put(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  ],
  validateRequest,
  updateUserRole
);

router.delete(
  '/users/:id',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validateRequest,
  deleteUser
);

export default router;

