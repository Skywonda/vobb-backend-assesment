import mongoose, { Document, Schema } from 'mongoose';

export interface IManager extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
}, {
  timestamps: true
});


export const Manager = mongoose.model<IManager>('Manager', ManagerSchema);