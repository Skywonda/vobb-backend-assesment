import { z } from 'zod';
import { ORDER_DEFAULTS } from '../constants/order.constants';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createOrderSchema = z.object({
  body: z.object({
    carId: z
      .string()
      .min(1, 'Car ID is required')
      .regex(objectIdRegex, 'Invalid Car ID format'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(ORDER_DEFAULTS.MAX_QUANTITY, `Quantity cannot exceed ${ORDER_DEFAULTS.MAX_QUANTITY}`),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const processPaymentSchema = z.object({
  params: z.object({
    orderId: z
      .string()
      .min(1, 'Order ID is required')
      .regex(objectIdRegex, 'Invalid Order ID format'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z
      .string()
      .min(1, 'Order ID is required')
      .regex(objectIdRegex, 'Invalid Order ID format'),
  }),
  body: z.object({
    status: z.enum(['confirmed', 'rejected'], {
      errorMap: () => ({ message: 'Status must be either confirmed or rejected' }),
    }),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});