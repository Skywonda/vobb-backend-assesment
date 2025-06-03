import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCarSchema = z.object({
  body: z.object({
    brand: z.string().min(1, 'Brand is required').trim(),
    modelName: z.string().min(1, 'Model name is required').trim(),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    price: z.number().min(0, 'Price must be positive'),
    category: z.string().min(1, 'Category ID is required').regex(objectIdRegex, 'Invalid Category ID format'),
    mileage: z.number().min(0, 'Mileage must be positive'),
    transmission: z.enum(['manual', 'automatic']),
    fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
    engineSize: z.number().min(0, 'Engine size must be positive'),
    color: z.string().min(1, 'Color is required').trim(),
    vin: z.string().min(1, 'VIN is required').trim(),
    available: z.boolean().default(true),
    condition: z.enum(['new', 'used']),
    quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  }),
});

export const updateCarSchema = z.object({
  body: z.object({
    brand: z.string().min(1, 'Brand is required').trim().optional(),
    modelName: z.string().min(1, 'Model name is required').trim().optional(),
    year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    category: z.string().min(1, 'Category ID is required').regex(objectIdRegex, 'Invalid Category ID format').optional(),
    mileage: z.number().min(0, 'Mileage must be positive').optional(),
    transmission: z.enum(['manual', 'automatic']).optional(),
    fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']).optional(),
    engineSize: z.number().min(0, 'Engine size must be positive').optional(),
    color: z.string().min(1, 'Color is required').trim().optional(),
    vin: z.string().min(1, 'VIN is required').trim().optional(),
    available: z.boolean().optional(),
    condition: z.enum(['new', 'used']).optional(),
    quantity: z.number().min(0, 'Quantity must be non-negative').optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Car ID is required').regex(objectIdRegex, 'Invalid Car ID format'),
  }),
});