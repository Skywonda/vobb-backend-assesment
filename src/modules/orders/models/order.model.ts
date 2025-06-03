// src/modules/orders/models/order.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { ICar } from '../../cars/types/car.types';
import { ICustomer } from '../../customers/models/customers.model';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  OrderStatusType,
  PaymentStatusType
} from '../constants/order.constants';

export interface IOrder extends Document {
  car: mongoose.Types.ObjectId | ICar;
  customer: mongoose.Types.ObjectId | ICustomer;
  quantity: number;
  totalPrice: number;
  status: OrderStatusType;
  paymentStatus: PaymentStatusType;
  paymentReference: string;
  transactionId?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING_PAYMENT,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
    },
    approvedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ customer: 1, status: 1 });
OrderSchema.index({ car: 1, status: 1 });
OrderSchema.index({ createdAt: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);