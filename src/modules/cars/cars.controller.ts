import { Request, Response } from "express";
import CarService from "./services/cars.service";
import CategoryService from "./services/category.service";
import {
  UpdateCarDto,
  CarFilters,
  PaginationParams,
} from "./types/car.types";
import { NotFoundException, ForbiddenException, ConflictException } from "../../shared/errors/common.errors";
import { ResponseHandler } from "../../shared/utils/response.handler";
import { CreateCategoryDto, UpdateCategoryDto } from './types/category.types';

export const create = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const car = await CarService.create(req.body, req?.user?.id);
    ResponseHandler.created(res, car, 'Car created successfully');
  } catch (error) {
    if (error instanceof ConflictException || error instanceof NotFoundException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const findAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: CarFilters = {
      brand: req.query.brand as string,
      modelName: req.query.modelName as string,
      category: req.query.category as string,
      available: req.query.available === "true" ? true : req.query.available === "false" ? false : undefined,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      transmission: req.query.transmission as CarFilters['transmission'],
      fuelType: req.query.fuelType as CarFilters['fuelType'],
      condition: req.query.condition as CarFilters['condition'],
    };

    const pagination: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort: req.query.sort as string,
    };

    const result = await CarService.findAll(filters, pagination);
    ResponseHandler.paginated(
      res,
      result.data,
      pagination.page ?? 1,
      pagination.limit ?? 10,
      result.pagination.total,
      {
        excludeFields: ['__v'],
        metadata: { filters }
      }
    );
  } catch (error) {
    ResponseHandler.error(res, error as Error);
  }
};

export const findById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const car = await CarService.findById(req.params.id);
    ResponseHandler.success(res, car, undefined, { excludeFields: ['__v'] });
  } catch (error) {
    if (error instanceof NotFoundException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const update = async (
  req: Request<{ id: string }, any, UpdateCarDto>,
  res: Response
): Promise<void> => {
  try {
    const car = await CarService.update(req.params.id, req.body, req?.user?.id);
    ResponseHandler.success(res, car, 'Car updated successfully', { excludeFields: ['__v'] });
  } catch (error) {
    if (error instanceof NotFoundException ||
      error instanceof ForbiddenException ||
      error instanceof ConflictException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    await CarService.delete(req.params.id, req?.user?.id);
    ResponseHandler.success(res, undefined, 'Car deleted successfully');
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof ForbiddenException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const createCategory = async (req: Request<{}, {}, CreateCategoryDto>, res: Response): Promise<void> => {
  try {
    const category = await CategoryService.create(req.body);
    ResponseHandler.created(res, category, 'Category created successfully');
  } catch (error) {
    ResponseHandler.error(res, error as Error);
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryService.findAll();
    ResponseHandler.success(res, categories);
  } catch (error) {
    ResponseHandler.error(res, error as Error);
  }
};

export const getCategoryById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const category = await CategoryService.findById(req.params.id);
    ResponseHandler.success(res, category);
  } catch (error) {
    if (error instanceof NotFoundException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, {}, UpdateCategoryDto>,
  res: Response
): Promise<void> => {
  try {
    const category = await CategoryService.update(req.params.id, req.body);
    ResponseHandler.success(res, category, 'Category updated successfully');
  } catch (error) {
    if (error instanceof NotFoundException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};

export const deleteCategory = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await CategoryService.delete(req.params.id);
    ResponseHandler.success(res, undefined, 'Category deleted successfully');
  } catch (error) {
    if (error instanceof NotFoundException) {
      ResponseHandler.error(res, error, error.statusCode);
    } else {
      ResponseHandler.error(res, error as Error);
    }
  }
};
