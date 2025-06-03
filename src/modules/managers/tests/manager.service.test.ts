import { ManagerService } from '../manager.service';
import { Manager } from '../models/manager.model';
import { AppError } from '../../../shared/errors/common.errors';
import { StatusCodes } from 'http-status-codes';
import '../../../tests/setup';

describe('ManagerService', () => {
  const fixtures = {
    validManager: {
      email: 'manager@test.com',
      password: 'password123',
      name: 'Test Manager',
    },
    updatedProfile: {
      name: 'Updated Manager',
    },
    invalidCredentials: {
      email: 'wrong@test.com',
      password: 'wrongpassword',
    },
    newPassword: 'newPassword123',
    nonExistentId: '507f1f77bcf86cd799439011',
  };

  let managerId: string;

  const registerManager = async (data = fixtures.validManager) => {
    const result = await ManagerService.register(data);
    managerId = result.manager.id;
    return result;
  };

  afterEach(async () => {
    await Manager.deleteMany({});
  });

  describe('register', () => {
    it('should register manager successfully', async () => {
      const result = await ManagerService.register(fixtures.validManager);

      expect(result).toMatchObject({
        manager: {
          email: fixtures.validManager.email,
          name: fixtures.validManager.name,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should hash password', async () => {
      const result = await ManagerService.register(fixtures.validManager);
      const savedManager = await Manager.findById(result.manager.id);

      expect(savedManager?.password).not.toBe(fixtures.validManager.password);
    });

    it('should throw error for duplicate email', async () => {
      await registerManager();

      await expect(registerManager()).rejects.toThrow(
        new AppError('Email already exists', StatusCodes.CONFLICT)
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await registerManager();
    });

    it('should login with correct credentials', async () => {
      const result = await ManagerService.login({
        email: fixtures.validManager.email,
        password: fixtures.validManager.password,
      });

      expect(result).toMatchObject({
        manager: {
          email: fixtures.validManager.email,
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should throw error for invalid email', async () => {
      await expect(ManagerService.login({
        email: fixtures.invalidCredentials.email,
        password: fixtures.validManager.password,
      })).rejects.toThrow(
        new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    });

    it('should throw error for invalid password', async () => {
      await expect(ManagerService.login({
        email: fixtures.validManager.email,
        password: fixtures.invalidCredentials.password,
      })).rejects.toThrow(
        new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    });
  });

  describe('getProfile', () => {
    beforeEach(async () => {
      await registerManager();
    });

    it('should return manager profile', async () => {
      const profile = await ManagerService.getProfile(managerId);

      expect(profile).toMatchObject({
        email: fixtures.validManager.email,
        name: fixtures.validManager.name,
      });
    });

    it('should throw error for non-existent manager', async () => {
      await expect(ManagerService.getProfile(fixtures.nonExistentId)).rejects.toThrow(
        new AppError('Manager not found', StatusCodes.NOT_FOUND)
      );
    });
  });

  describe('updateProfile', () => {
    beforeEach(async () => {
      await registerManager();
    });

    it('should update manager profile', async () => {
      const updated = await ManagerService.updateProfile(managerId, fixtures.updatedProfile);

      expect(updated).toMatchObject({
        name: fixtures.updatedProfile.name,
        email: fixtures.validManager.email,
      });
    });
  });

  describe('changePassword', () => {
    beforeEach(async () => {
      await registerManager();
    });

    it('should change password successfully', async () => {
      await expect(ManagerService.changePassword(managerId, {
        currentPassword: fixtures.validManager.password,
        newPassword: fixtures.newPassword,
      })).resolves.not.toThrow();
    });

    it('should throw error for wrong current password', async () => {
      await expect(ManagerService.changePassword(managerId, {
        currentPassword: fixtures.invalidCredentials.password,
        newPassword: fixtures.newPassword,
      })).rejects.toThrow(
        new AppError('Current password is incorrect', StatusCodes.UNAUTHORIZED)
      );
    });
  });
});