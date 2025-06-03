import mongoose, { Schema } from "mongoose";
import { ICar } from "../types/car.types";

export type ICarDocument = ICar & mongoose.Document;

const CarSchema: Schema = new Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    transmission: {
      type: String,
      required: true,
      enum: ['manual', 'automatic'],
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    },
    engineSize: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    vin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'used'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

CarSchema.index({ brand: 1, modelName: 1 });
CarSchema.index({ price: 1, year: 1 });

export const Car = mongoose.model<ICarDocument>("Car", CarSchema);
