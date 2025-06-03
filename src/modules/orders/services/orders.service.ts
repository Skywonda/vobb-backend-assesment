import { Order, IOrder } from '../models/order.model';
import { Car } from '../../cars/models/car.model';
import {
  CreateOrderParams,
  ProcessPaymentParams,
  UpdateOrderStatusParams,
  GetOrdersParams,
  GetOrderByIdParams
} from '../types/order.types';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_SIMULATION,
  ORDER_DEFAULTS
} from '../constants/order.constants';
import { ConflictException, NotFoundException, BadRequestException } from '../../../shared/errors/common.errors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {

  static async createOrder(params: CreateOrderParams): Promise<IOrder> {
    const car = await Car.findById(params.orderData.carId);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (!car.available || car.quantity < params.orderData.quantity) {
      throw new ConflictException('Insufficient stock available');
    }

    const totalPrice = car.price * params.orderData.quantity;
    const paymentReference = `${ORDER_DEFAULTS.PAYMENT_REFERENCE_PREFIX}${uuidv4()}`;

    const order = await Order.create({
      car: car._id,
      customer: params.customerId,
      quantity: params.orderData.quantity,
      totalPrice,
      paymentReference,
      notes: params.orderData.notes,
      status: ORDER_STATUS.PENDING_PAYMENT,
      paymentStatus: PAYMENT_STATUS.PENDING,
    });

    return order;
  }

  static async processPayment(params: ProcessPaymentParams): Promise<IOrder> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const order = await Order.findById(params.orderId).session(session);
        if (!order) {
          throw new NotFoundException('Order not found');
        }

        if (order.customer.toString() !== params.customerId) {
          throw new ConflictException('Not authorized to process this order');
        }

        if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
          throw new ConflictException('Order is not in pending payment status');
        }

        const paymentResult = await this.simulatePayment();

        if (paymentResult.success) {
          const car = await Car.findById(order.car).session(session);
          if (!car || car.quantity < order.quantity) {
            throw new ConflictException('Car no longer available');
          }

          await Car.findByIdAndUpdate(
            car._id,
            {
              $inc: { quantity: -order.quantity },
              available: car.quantity - order.quantity > 0,
            },
            { session }
          );

          order.status = ORDER_STATUS.PAID;
          order.paymentStatus = PAYMENT_STATUS.COMPLETED;
          order.transactionId = paymentResult.transactionId;
          await order.save({ session });

          return order;
        } else {
          order.paymentStatus = PAYMENT_STATUS.FAILED;
          await order.save({ session });

          throw new BadRequestException(`Payment failed: ${paymentResult.error}`);
        }
      });
    } finally {
      await session.endSession();
    }
  }

  static async updateOrderStatus(params: UpdateOrderStatusParams): Promise<IOrder> {
    const order = await Order.findById(params.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== ORDER_STATUS.PAID) {
      throw new ConflictException('Order must be paid before status update');
    }

    if (params.updateData.status === ORDER_STATUS.REJECTED) {
      await Car.findByIdAndUpdate(order.car, {
        $inc: { quantity: order.quantity },
        available: true,
      });
    }

    order.status = params.updateData.status;
    order.approvedBy = new mongoose.Types.ObjectId(params.managerId);
    order.approvedAt = new Date();
    order.notes = params.updateData.notes;

    return await order.save();
  }

  static async getOrders(params: GetOrdersParams) {
    const { page = 1, limit = ORDER_DEFAULTS.PAGE_SIZE } = params.pagination || {};
    const skip = (page - 1) * limit;

    const query = this.buildFilterQuery(params.filters);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('car', 'brand modelName year price')
        .populate('customer', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerOrders(customerId: string, page = 1, limit = ORDER_DEFAULTS.PAGE_SIZE) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: customerId })
        .populate('car', 'brand modelName year price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ customer: customerId }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getOrderById(params: GetOrderByIdParams): Promise<IOrder> {
    const order = await Order.findById(params.orderId)
      .populate('car')
      .populate('customer', '-password')
      .populate('approvedBy', 'name email');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private static async simulatePayment(): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, PAYMENT_SIMULATION.PROCESSING_DELAY));

    const success = Math.random() > (1 - PAYMENT_SIMULATION.SUCCESS_RATE);

    if (success) {
      return {
        success: true,
        transactionId: `${ORDER_DEFAULTS.TRANSACTION_PREFIX}${uuidv4()}`,
      };
    } else {
      return {
        success: false,
        error: PAYMENT_SIMULATION.ERROR_MESSAGE,
      };
    }
  }

  private static buildFilterQuery(filters: any): Record<string, any> {
    const query: Record<string, any> = {};

    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.customerId) query.customer = filters.customerId;
    if (filters.carId) query.car = filters.carId;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return query;
  }
}