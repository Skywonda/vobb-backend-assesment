import CarService from '../services/cars.service';
import { Car } from '../models/car.model';
import { Category } from '../models/category.model';
import { Manager } from '../../managers/models/manager.model';
import { ConflictException, NotFoundException, ForbiddenException } from '../../../shared/errors/common.errors';
import { PasswordUtil } from '../../../shared/utils/password.util';
import '../../../tests/setup';

describe('CarService', () => {
  const fixtures = {
    manager: {
      name: 'Test Manager',
      email: 'manager@test.com',
      password: 'password123',
    },
    secondManager: {
      name: 'Second Manager',
      email: 'manager2@test.com',
      password: 'password123',
    },
    category: {
      name: 'Sedan',
      description: 'Four-door passenger car',
    },
    validCar: {
      brand: 'Toyota',
      modelName: 'Camry',
      year: 2023,
      price: 35000,
      mileage: 0,
      transmission: 'automatic' as const,
      fuelType: 'petrol' as const,
      engineSize: 2.5,
      color: 'Silver',
      vin: 'TOY123456789',
      condition: 'new' as const,
      quantity: 5,
    },
    duplicateCar: {
      brand: 'Toyota',
      modelName: 'Camry',
      year: 2023,
      price: 40000,
      mileage: 0,
      transmission: 'automatic' as const,
      fuelType: 'petrol' as const,
      engineSize: 2.5,
      color: 'Blue',
      vin: 'TOY123456790',
      condition: 'new' as const,
      quantity: 3,
    },
    updateData: {
      price: 32000,
      color: 'Black',
      quantity: 8,
    },
    filters: {
      brand: 'Toyota',
      minPrice: 30000,
      maxPrice: 50000,
      available: true,
    },
    pagination: {
      page: 1,
      limit: 10,
      sort: '-price',
    },
    nonExistentId: '507f1f77bcf86cd799439011',
  };

  let managerId: string;
  let secondManagerId: string;
  let categoryId: string;
  let carId: string;

  const createManager = async (data = fixtures.manager) => {
    const hashedPassword = await PasswordUtil.hash(data.password);
    const manager = await Manager.create({ ...data, password: hashedPassword });
    return manager.id;
  };

  const createCategory = async (data = fixtures.category) => {
    const category = await Category.create(data);
    return category.id;
  };

  const createCar = async (data = fixtures.validCar, manager = managerId, category = categoryId) => {
    const carData = { ...data, category, manager };
    const car = await CarService.create(carData, manager);
    return car;
  };

  beforeEach(async () => {
    managerId = await createManager();
    secondManagerId = await createManager(fixtures.secondManager);
    categoryId = await createCategory();
  });

  describe('create', () => {
    it('should create car successfully', async () => {
      const carData = { ...fixtures.validCar, category: categoryId };
      const car = await CarService.create(carData, managerId);

      expect(car).toMatchObject({
        brand: fixtures.validCar.brand,
        modelName: fixtures.validCar.modelName,
        year: fixtures.validCar.year,
        price: fixtures.validCar.price,
        available: true,
      });
      expect(car.category.toString()).toBe(categoryId);
      expect(car.manager.toString()).toBe(managerId);
    });

    it('should throw error for duplicate car', async () => {
      const carData = { ...fixtures.validCar, category: categoryId };
      await CarService.create(carData, managerId);

      await expect(CarService.create(carData, managerId)).rejects.toThrow(
        new ConflictException('Car already exists')
      );
    });

    it('should throw error for invalid category', async () => {
      const carData = { ...fixtures.validCar, category: fixtures.nonExistentId };

      await expect(CarService.create(carData, managerId)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });

    it('should allow different managers to create same car specs', async () => {
      const carData = { ...fixtures.validCar, category: categoryId };
      await CarService.create({ ...carData, vin: 'TOY123456791' }, managerId);

      await expect(CarService.create(carData, secondManagerId)).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await createCar();
      await createCar({ ...fixtures.duplicateCar, vin: 'TOY123456791' });
    });

    it('should return paginated cars', async () => {
      const result = await CarService.findAll({}, fixtures.pagination);

      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ brand: fixtures.validCar.brand }),
          expect.objectContaining({ brand: fixtures.duplicateCar.brand }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
        },
      });
    });

    it('should filter cars by brand', async () => {
      const result = await CarService.findAll({ brand: 'Toyota' }, fixtures.pagination);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(car => car.brand === 'Toyota')).toBe(true);
    });

    it('should filter cars by price range', async () => {
      const result = await CarService.findAll(
        { minPrice: 30000, maxPrice: 40000 },
        fixtures.pagination
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.every(car => car.price >= 30000 && car.price <= 40000)).toBe(true);
    });

    it('should sort cars by price descending', async () => {
      const result = await CarService.findAll({}, { ...fixtures.pagination, sort: '-price' });

      expect(result.data[0].price).toBeGreaterThanOrEqual(result.data[1].price);
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      const car = await createCar();
      carId = car.id;
    });

    it('should return car by id', async () => {
      const car = await CarService.findById(carId);

      expect(car).toMatchObject({
        brand: fixtures.validCar.brand,
        modelName: fixtures.validCar.modelName,
        category: expect.objectContaining({
          name: fixtures.category.name,
        }),
      });
    });

    it('should throw error for non-existent car', async () => {
      await expect(CarService.findById(fixtures.nonExistentId)).rejects.toThrow(
        new NotFoundException('Car not found')
      );
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      const car = await createCar();
      carId = car.id;
    });

    it('should update car successfully', async () => {
      const updated = await CarService.update(carId, fixtures.updateData, managerId);

      expect(updated).toMatchObject({
        price: fixtures.updateData.price,
        color: fixtures.updateData.color,
        quantity: fixtures.updateData.quantity,
        brand: fixtures.validCar.brand,
      });
    });

    it('should throw error for non-existent car', async () => {
      await expect(CarService.update(fixtures.nonExistentId, fixtures.updateData, managerId))
        .rejects.toThrow(new NotFoundException('Car not found'));
    });

    it('should throw error for unauthorized manager', async () => {
      await expect(CarService.update(carId, fixtures.updateData, secondManagerId))
        .rejects.toThrow(new ForbiddenException('Not authorized to update this car'));
    });

    it('should update car with valid category', async () => {
      const newCategory = await createCategory({ name: 'SUV', description: 'Sport Utility Vehicle' });


      const updated = await CarService.update(carId, {
        category: newCategory,
        price: 40000
      }, managerId);


      expect(updated.category.id).toBe(newCategory);
      expect(updated.price).toBe(40000);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      const car = await createCar();
      carId = car.id;
    });

    it('should delete car successfully', async () => {
      await expect(CarService.delete(carId, managerId)).resolves.not.toThrow();

      const deletedCar = await Car.findById(carId);
      expect(deletedCar).toBeNull();
    });

    it('should throw error for non-existent car', async () => {
      await expect(CarService.delete(fixtures.nonExistentId, managerId))
        .rejects.toThrow(new NotFoundException('Car not found'));
    });

    it('should throw error for unauthorized manager', async () => {
      await expect(CarService.delete(carId, secondManagerId))
        .rejects.toThrow(new ForbiddenException('Not authorized to delete this car'));
    });
  });
});