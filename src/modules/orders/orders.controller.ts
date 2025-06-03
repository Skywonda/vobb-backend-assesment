import { Request, Response } from 'express';
import { OrderService } from './services/orders.service';
import { ResponseHandler } from '../../shared/utils/response.handler';
import { AppError } from '../../shared/errors/common.errors';
import { ORDER_DEFAULTS, OrderStatusType, PaymentStatusType } from './constants/order.constants';
import { OrderFilters } from './types/order.types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderService.createOrder({
      customerId: req?.user?.id,
      orderData: req.body,
    });

    ResponseHandler.created(res, order, 'Order created successfully. Please proceed with payment.');
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderService.processPayment({
      orderId: req.params.orderId,
      customerId: req?.user?.id,
    });

    ResponseHandler.success(res, order, 'Payment processed successfully');
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderService.updateOrderStatus({
      orderId: req.params.orderId,
      managerId: req?.user?.id,
      updateData: req.body,
    });

    ResponseHandler.success(res, order, 'Order status updated successfully');
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: OrderFilters = {
      status: req.query.status as OrderStatusType,
      paymentStatus: req.query.paymentStatus as PaymentStatusType,
      customerId: req.query.customerId as string,
      carId: req.query.carId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const pagination = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : ORDER_DEFAULTS.PAGE_SIZE,
    };

    const result = await OrderService.getOrders({ filters, pagination });

    ResponseHandler.paginated(
      res,
      result.orders,
      pagination.page,
      pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string) : ORDER_DEFAULTS.PAGE_SIZE;

    const result = await OrderService.getCustomerOrders(req?.user?.id, page, limit);

    ResponseHandler.paginated(
      res,
      result.orders,
      page,
      limit,
      result.pagination.total
    );
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await OrderService.getOrderById({
      orderId: req.params.orderId,
    });

    ResponseHandler.success(res, order);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};