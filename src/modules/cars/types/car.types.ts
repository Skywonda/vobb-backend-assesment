import mongoose from "mongoose";
import { ICategory } from "./category.types";

export interface ICar {
  brand: string;
  modelName: string;
  year: number;
  price: number;
  category: mongoose.Types.ObjectId | ICategory;
  manager: mongoose.Types.ObjectId;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  engineSize: number;
  color: string;
  vin: string;
  available: boolean;
  condition: 'new' | 'used';
  quantity: number;
}

export interface CreateCarDto {
  brand: string;
  modelName: string;
  year: number;
  price: number;
  category: string;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  engineSize: number;
  color: string;
  vin: string;
  available?: boolean;
  condition: 'new' | 'used';
  quantity?: number;
}

export interface UpdateCarDto extends Partial<CreateCarDto> { }

export interface CarFilters {
  brand?: string;
  modelName?: string;
  category?: string;
  available?: boolean;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  transmission?: 'manual' | 'automatic';
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  condition?: 'new' | 'used';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
} 