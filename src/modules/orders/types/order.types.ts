import {
  OrderStatusType,
  PaymentStatusType
} from '../constants/order.constants';

export interface CreateOrderDto {
  carId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: 'confirmed' | 'rejected';
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatusType;
  paymentStatus?: PaymentStatusType;
  customerId?: string;
  carId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CreateOrderParams {
  customerId: string;
  orderData: CreateOrderDto;
}

export interface ProcessPaymentParams {
  orderId: string;
  customerId: string;
}

export interface UpdateOrderStatusParams {
  orderId: string;
  managerId: string;
  updateData: UpdateOrderStatusDto;
}

export interface GetOrdersParams {
  filters: OrderFilters;
  pagination?: PaginationParams;
}

export interface GetOrderByIdParams {
  orderId: string;
}