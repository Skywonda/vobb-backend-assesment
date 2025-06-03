import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types/category.types';

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ name: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema); 