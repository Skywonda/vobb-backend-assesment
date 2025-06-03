// src/modules/orders/orders.routes.ts

import { Router } from 'express';
import * as orderController from './orders.controller';
import { authenticateCustomer, authenticateManager } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import {
  createOrderSchema,
  processPaymentSchema,
  updateOrderStatusSchema
} from './validations/order.validation';
import { asHandler } from '../../shared/types/express.types';

const router = Router();

router.post('/',
  authenticateCustomer,
  validateRequest(createOrderSchema),
  asHandler(orderController.createOrder)
);

router.post('/:orderId/payment',
  authenticateCustomer,
  validateRequest(processPaymentSchema),
  asHandler(orderController.processPayment)
);

router.get('/my-orders',
  authenticateCustomer,
  asHandler(orderController.getMyOrders)
);

router.patch('/:orderId/status',
  authenticateManager,
  validateRequest(updateOrderStatusSchema),
  asHandler(orderController.updateOrderStatus)
);

router.get('/',
  authenticateManager,
  asHandler(orderController.getOrders)
);

router.get('/:orderId',
  asHandler(orderController.getOrderById)
);

export const orderRouter = router;