import { CustomerService } from '../customers.service';
import { Customer } from '../models/customers.model';
import { AppError } from '../../../shared/errors/common.errors';
import { StatusCodes } from 'http-status-codes';
import '../../../tests/setup';

describe('CustomerService', () => {
  const fixtures = {
    validCustomer: {
      email: 'customer@test.com',
      password: 'password123',
      name: 'Test Customer',
      phone: '+1234567890',
    },
    secondCustomer: {
      email: 'customer2@test.com',
      name: 'Customer Two',
      password: 'password123',
      phone: '+1234567891',
    },
    invalidCredentials: {
      email: 'wrong@test.com',
      password: 'wrongpassword',
    },
    updateData: {
      name: 'Updated Customer',
      phone: '+9876543210',
    },
    partialUpdate: {
      name: 'New Name Only',
    },
    nonExistentId: '507f1f77bcf86cd799439011',
  };

  let customerId: string;

  const registerCustomer = async (data = fixtures.validCustomer) => {
    const result = await CustomerService.register(data);
    customerId = result.customer.id;
    return result;
  };

  afterEach(async () => {
    await Customer.deleteMany({});
  });

  describe('register', () => {
    it('should register customer successfully', async () => {
      const result = await CustomerService.register(fixtures.validCustomer);

      expect(result).toMatchObject({
        customer: {
          email: fixtures.validCustomer.email,
          name: fixtures.validCustomer.name,
          phone: fixtures.validCustomer.phone,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should hash password', async () => {
      const result = await CustomerService.register(fixtures.validCustomer);
      const savedCustomer = await Customer.findById(result.customer.id);

      expect(savedCustomer?.password).not.toBe(fixtures.validCustomer.password);
    });

    it('should throw error for duplicate email', async () => {
      await registerCustomer();

      await expect(registerCustomer()).rejects.toThrow(
        new AppError('Email already exists', StatusCodes.CONFLICT)
      );
    });

    it('should set customer as active by default', async () => {
      const result = await registerCustomer();
      const savedCustomer = await Customer.findById(result.customer.id);

      expect(savedCustomer?.isActive).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await registerCustomer();
    });

    it('should login with correct credentials', async () => {
      const result = await CustomerService.login({
        email: fixtures.validCustomer.email,
        password: fixtures.validCustomer.password,
      });

      expect(result).toMatchObject({
        customer: {
          email: fixtures.validCustomer.email,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should throw error for invalid email', async () => {
      await expect(CustomerService.login({
        email: fixtures.invalidCredentials.email,
        password: fixtures.validCustomer.password,
      })).rejects.toThrow(
        new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    });

    it('should throw error for invalid password', async () => {
      await expect(CustomerService.login({
        email: fixtures.validCustomer.email,
        password: fixtures.invalidCredentials.password,
      })).rejects.toThrow(
        new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    });
  });

  describe('getProfile', () => {
    beforeEach(async () => {
      await registerCustomer();
    });

    it('should return customer profile without password', async () => {
      const profile = await CustomerService.getProfile(customerId);

      expect(profile).toMatchObject({
        email: fixtures.validCustomer.email,
        name: fixtures.validCustomer.name,
        phone: fixtures.validCustomer.phone,
      });
    });

    it('should throw error for non-existent customer', async () => {
      await expect(CustomerService.getProfile(fixtures.nonExistentId)).rejects.toThrow(
        new AppError('Customer not found', StatusCodes.NOT_FOUND)
      );
    });
  });

  describe('updateProfile', () => {
    beforeEach(async () => {
      await registerCustomer();
    });

    it('should update customer profile', async () => {
      const updated = await CustomerService.updateProfile(customerId, fixtures.updateData);

      expect(updated).toMatchObject({
        name: fixtures.updateData.name,
        phone: fixtures.updateData.phone,
        email: fixtures.validCustomer.email,
      });
    });

    it('should update only provided fields', async () => {
      const updated = await CustomerService.updateProfile(customerId, fixtures.partialUpdate);

      expect(updated).toMatchObject({
        name: fixtures.partialUpdate.name,
        phone: fixtures.validCustomer.phone,
      });
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await registerCustomer();
      await CustomerService.register(fixtures.secondCustomer);
    });

    it('should return paginated customers', async () => {
      const result = await CustomerService.findAll(1, 10);

      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ email: fixtures.validCustomer.email }),
          expect.objectContaining({ email: fixtures.secondCustomer.email }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const result = await CustomerService.findAll(1, 1);

      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            email: expect.stringMatching(/^customer.*@test.com$/),
          }),
        ]),
        pagination: {
          pages: 2,
        },
      });
      expect(result.data).toHaveLength(1);
    });
  });
});