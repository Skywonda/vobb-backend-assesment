import { Car, ICarDocument } from "../models/car.model";
import { Category } from "../models/category.model";
import {
  CreateCarDto,
  UpdateCarDto,
  CarFilters,
  PaginationParams,
} from "../types/car.types";
import { FilterQuery, Types } from "mongoose";
import { ConflictException, NotFoundException, ForbiddenException } from "../../../shared/errors/common.errors";
import { logger } from "../../../shared/utils/logger.service";

class CarService {
  private static async checkDuplicateCar(createCarDto: CreateCarDto, managerId: string): Promise<ICarDocument | null> {
    return await Car.findOne({
      brand: createCarDto.brand,
      manager: managerId,
      modelName: createCarDto.modelName,
      year: createCarDto.year,
      transmission: createCarDto.transmission,
      fuelType: createCarDto.fuelType,
      engineSize: createCarDto.engineSize,
      vin: createCarDto.vin,
      condition: createCarDto.condition,
    });
  }

  static async create(createCarDto: CreateCarDto, managerId: string): Promise<ICarDocument> {
    const duplicateCar = await this.checkDuplicateCar(createCarDto, managerId);

    // logger.info("duplicateCar: ", duplicateCar);
    if (duplicateCar) {
      throw new ConflictException('Car already exists');
    }

    const carCategory = await Category.findById(createCarDto.category);
    if (!carCategory) {
      throw new NotFoundException('Category not found');
    }

    const car = new Car({
      brand: createCarDto.brand,
      modelName: createCarDto.modelName,
      year: createCarDto.year,
      price: createCarDto.price,
      category: carCategory._id,
      mileage: createCarDto.mileage,
      transmission: createCarDto.transmission,
      fuelType: createCarDto.fuelType,
      engineSize: createCarDto.engineSize,
      color: createCarDto.color,
      vin: createCarDto.vin,
      condition: createCarDto.condition,
      manager: new Types.ObjectId(managerId)
    });
    return await car.save();
  }

  static async findAll(filters: CarFilters, pagination: PaginationParams) {
    const query = this.buildFilterQuery(filters);
    const { page = 1, limit = 10, sort } = pagination;
    const skip = (page - 1) * limit;
    const sortObj = this.buildSortObject(sort);

    const [cars, total] = await Promise.all([
      Car.find(query)
        .populate('category')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Car.countDocuments(query),
    ]);

    return {
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string): Promise<ICarDocument> {
    const car = await Car.findById(id).populate('category').lean();
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  static async update(id: string, updateCarDto: UpdateCarDto, managerId: string): Promise<ICarDocument> {
    const car = await Car.findById(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.manager.toString() !== managerId) {
      throw new ForbiddenException('Not authorized to update this car');
    }

    if (this.hasSpecChanges(updateCarDto)) {
      const duplicateCar = await this.checkDuplicateCar({ ...car.toObject(), ...updateCarDto } as CreateCarDto, managerId);
      if (duplicateCar && duplicateCar._id instanceof Types.ObjectId && duplicateCar._id.toString() !== id) {
        throw new ConflictException('Car with these specifications already exists');
      }
    }

    if (updateCarDto.category) {
      const category = await Category.findById(updateCarDto.category);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(id, updateCarDto, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!updatedCar) {
      throw new NotFoundException('Car not found after update');
    }

    return updatedCar;
  }

  static async delete(id: string, managerId: string): Promise<void> {
    const car = await Car.findById(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.manager.toString() !== managerId) {
      throw new ForbiddenException('Not authorized to delete this car');
    }

    await Car.findByIdAndDelete(id);
  }

  private static buildFilterQuery(filters: CarFilters): FilterQuery<ICarDocument> {
    const query: FilterQuery<ICarDocument> = {};

    if (filters.brand) query.brand = new RegExp(filters.brand, "i");
    if (filters.modelName) query.modelName = new RegExp(filters.modelName, "i");
    if (filters.category) query.category = filters.category;
    if (filters.available !== undefined) query.available = filters.available;
    if (filters.year) query.year = filters.year;
    if (filters.transmission) query.transmission = filters.transmission;
    if (filters.fuelType) query.fuelType = filters.fuelType;
    if (filters.condition) query.condition = filters.condition;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    return query;
  }

  private static buildSortObject(sort?: string): Record<string, 1 | -1> {
    if (!sort) return { createdAt: -1 };

    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith("-") ? -1 : 1;
    return { [sortField]: sortOrder };
  }

  private static hasSpecChanges(updateCarDto: UpdateCarDto): boolean {
    const specFields: (keyof CreateCarDto)[] = [
      'brand', 'modelName', 'year', 'transmission',
      'fuelType', 'engineSize', 'color', 'condition'
    ];
    return specFields.some(field => field in updateCarDto);
  }
}

export default CarService;