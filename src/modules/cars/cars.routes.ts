import { Router } from 'express';
import * as carController from './cars.controller';
import { authenticateManager } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { createCarSchema, updateCarSchema } from './validations/car.validation';
import { createCategorySchema, updateCategorySchema } from './validations/category.validation';
import { asHandler } from '../../shared/types/express.types';

const router = Router();

router.get('/categories', asHandler(carController.getAllCategories));

router.post('/categories',
  authenticateManager,
  validateRequest(createCategorySchema),
  asHandler(carController.createCategory)
);
router.put('/categories/:id',
  authenticateManager,
  validateRequest(updateCategorySchema),
  asHandler<{ id: string }>(carController.updateCategory)
);
router.delete('/categories/:id',
  authenticateManager,
  asHandler<{ id: string }>(carController.deleteCategory)
);

// Public routes - anyone can view cars
router.get('/', carController.findAll);
router.get('/:id', carController.findById);

// Protected routes - only authenticated managers
router.post('/',
  authenticateManager,
  validateRequest(createCarSchema),
  asHandler(carController.create)

);
router.put('/:id',
  authenticateManager,
  validateRequest(updateCarSchema),
  asHandler<{ id: string }>(carController.update)
);
router.delete('/:id',
  authenticateManager,
  asHandler<{ id: string }>(carController.remove)
);

export const carsRouter = router;