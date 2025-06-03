import { Category } from '../models/category.model';
import { CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import { NotFoundException } from '../../../shared/errors/common.errors';

class CategoryService {
  static async create(data: CreateCategoryDto) {
    const category = await Category.create(data);
    return category;
  }

  static async findAll() {
    const categories = await Category.find({ isActive: true });
    return categories;
  }

  static async findById(id: string) {
    const category = await Category.findOne({ _id: id, isActive: true });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  static async update(id: string, data: UpdateCategoryDto) {
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  static async delete(id: string) {
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}

export default CategoryService; 