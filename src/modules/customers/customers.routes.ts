import { Router } from 'express';
import * as customerController from './customers.controller';
import { authenticateCustomer } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { 
  customerLoginSchema, 
  customerRegisterSchema, 
  updateProfileSchema 
} from './validations/customer.validation';
import { asHandler } from '../../shared/types/express.types';

const router = Router();

// Public routes
router.post('/login', validateRequest(customerLoginSchema), asHandler(customerController.login));
router.post('/register', validateRequest(customerRegisterSchema), asHandler(customerController.register));

// Protected routes - requires authentication
router.get('/profile', authenticateCustomer, asHandler(customerController.getProfile));
router.patch('/profile', authenticateCustomer, validateRequest(updateProfileSchema), asHandler(customerController.updateProfile));

export const customerRouter = router;