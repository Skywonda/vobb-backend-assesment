// src/tests/utils.ts

import mongoose from 'mongoose';
import { Manager } from '../modules/managers/models/manager.model';
import { Customer } from '../modules/customers/models/customers.model';
import { Car } from '../modules/cars/models/car.model';
import { Category } from '../modules/cars/models/category.model';
import { PasswordUtil } from '../shared/utils/password.util';

export const createTestManager = async (overrides: any = {}) => {
  const managerData = {
    name: 'Test Manager',
    email: 'manager@test.com',
    password: await PasswordUtil.hash('password123'),
    isActive: true,
    ...overrides,
  };

  return await Manager.create(managerData);
};

export const createTestCustomer = async (overrides: any = {}) => {
  const customerData = {
    name: 'Test Customer',
    email: 'customer@test.com',
    password: await PasswordUtil.hash('password123'),
    phone: '+1234567890',
    isActive: true,
    ...overrides,
  };

  return await Customer.create(customerData);
};

export const createTestCategory = async (overrides: any = {}) => {
  const categoryData = {
    name: 'Test Category',
    description: 'Test category description',
    isActive: true,
    ...overrides,
  };

  return await Category.create(categoryData);
};

export const createTestCar = async (overrides: any = {}) => {
  const category = await createTestCategory();
  const manager = await createTestManager();

  const carData = {
    brand: 'Toyota',
    modelName: 'Camry',
    year: 2023,
    price: 35000,
    category: category._id,
    manager: manager._id,
    mileage: 0,
    transmission: 'automatic',
    fuelType: 'petrol',
    engineSize: 2.5,
    color: 'Silver',
    vin: `VIN${Date.now()}`,
    available: true,
    condition: 'new',
    quantity: 5,
    ...overrides,
  };

  return await Car.create(carData);
};

export const generateValidObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

export const mockJwtTokens = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
};

export const expectValidationError = (error: any, field: string) => {
  expect(error).toBeDefined();
  expect(error.message).toContain(field);
};

export const expectNotFoundError = (error: any, resource: string) => {
  expect(error).toBeDefined();
  expect(error.message).toContain(`${resource} not found`);
  expect(error.statusCode).toBe(404);
};

export const expectConflictError = (error: any, message: string) => {
  expect(error).toBeDefined();
  expect(error.message).toContain(message);
  expect(error.statusCode).toBe(409);
};

export const expectUnauthorizedError = (error: any) => {
  expect(error).toBeDefined();
  expect(error.statusCode).toBe(401);
};