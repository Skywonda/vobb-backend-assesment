import { Router } from 'express';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { authenticateManager } from '../../shared/middleware/auth.middleware';
import * as managerController from './manager.controller';
import {
  managerLoginSchema,
  managerRegisterSchema,
  changePasswordSchema,
  updateProfileSchema
} from './validations/manager.validation';
import { asHandler } from '../../shared/types/express.types';

const router = Router();

// Public routes
router.post('/login', validateRequest(managerLoginSchema), asHandler(managerController.login));
router.post('/register', validateRequest(managerRegisterSchema), asHandler(managerController.register));

// Protected routes - requires authentication
router.get('/profile', authenticateManager, asHandler(managerController.getProfile));
router.patch('/profile', authenticateManager, validateRequest(updateProfileSchema), asHandler(managerController.updateProfile));
router.post('/change-password', authenticateManager, validateRequest(changePasswordSchema), asHandler(managerController.changePassword));

export const managerRouter = router;

