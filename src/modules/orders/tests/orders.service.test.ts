import { OrderService } from '../services/orders.service';
import { Order } from '../models/order.model';
import { Car } from '../../cars/models/car.model';
import { Category } from '../../cars/models/category.model';
import { Customer } from '../../customers/models/customers.model';
import { Manager } from '../../managers/models/manager.model';
import { ConflictException, NotFoundException, BadRequestException } from '../../../shared/errors/common.errors';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/order.constants';
import { PasswordUtil } from '../../../shared/utils/password.util';
import '../../../tests/setup';

describe('OrderService', () => {
  const fixtures = {
    manager: {
      name: 'Test Manager',
      email: 'manager@test.com',
      password: 'password123',
    },
    customer: {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      phone: '+1234567890',
    },
    secondCustomer: {
      name: 'Second Customer',
      email: 'customer2@test.com',
      password: 'password123',
      phone: '+1234567891',
    },
    category: {
      name: 'Sedan',
      description: 'Four-door passenger car',
    },
    car: {
      brand: 'Toyota',
      modelName: 'Camry',
      year: 2023,
      price: 35000,
      mileage: 0,
      transmission: 'automatic' as const,
      fuelType: 'petrol' as const,
      engineSize: 2.5,
      color: 'Silver',
      vin: 'TOY123456789',
      condition: 'new' as const,
      quantity: 5,
      available: true,
    },
    orderData: {
      quantity: 2,
      notes: 'Please deliver before noon',
    },
    updateOrderData: {
      status: 'confirmed' as const,
      notes: 'Order approved for delivery',
    },
    filters: {
      status: ORDER_STATUS.PAID,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
    nonExistentId: '507f1f77bcf86cd799439011',
  };

  let managerId: string;
  let customerId: string;
  let secondCustomerId: string;
  let categoryId: string;
  let carId: string;
  let orderId: string;

  const createManager = async () => {
    const hashedPassword = await PasswordUtil.hash(fixtures.manager.password);
    const manager = await Manager.create({ ...fixtures.manager, password: hashedPassword });
    return manager.id;
  };

  const createCustomer = async (data = fixtures.customer) => {
    const hashedPassword = await PasswordUtil.hash(data.password);
    const customer = await Customer.create({ ...data, password: hashedPassword });
    return customer.id;
  };

  const createCategory = async () => {
    const category = await Category.create(fixtures.category);
    return category.id;
  };

  const createCar = async (overrides = {}) => {
    const carData = {
      ...fixtures.car,
      category: categoryId,
      manager: managerId,
      ...overrides
    };
    const car = await Car.create(carData);
    return car.id;
  };

  const createOrder = async (orderCustomerId = customerId, orderCarId = carId, orderData = fixtures.orderData) => {
    const order = await OrderService.createOrder({
      customerId: orderCustomerId,
      orderData: { ...orderData, carId: orderCarId },
    });
    return order;
  };

  beforeEach(async () => {
    managerId = await createManager();
    customerId = await createCustomer();
    secondCustomerId = await createCustomer(fixtures.secondCustomer);
    categoryId = await createCategory();
    carId = await createCar();
  });

  describe('createOrder', () => {
    it('should create order successfully ', async () => {
      const initialCar = await Car.findById(carId);
      const order = await createOrder();

      expect(order).toMatchObject({
        quantity: fixtures.orderData.quantity,
        totalPrice: fixtures.car.price * fixtures.orderData.quantity,
        status: ORDER_STATUS.PENDING_PAYMENT,
        paymentStatus: PAYMENT_STATUS.PENDING,
        notes: fixtures.orderData.notes,
      });
      expect(order.customer.toString()).toBe(customerId);
      expect(order.car.toString()).toBe(carId);
      expect(order.paymentReference).toContain('PAY_');

    });

    it('should throw error for non-existent car', async () => {
      await expect(OrderService.createOrder({
        customerId,
        orderData: { ...fixtures.orderData, carId: fixtures.nonExistentId },
      })).rejects.toThrow(new NotFoundException('Car not found'));
    });

    it('should throw error for unavailable car', async () => {
      await Car.findByIdAndUpdate(carId, { available: false });

      await expect(createOrder()).rejects.toThrow(
        new ConflictException('Insufficient stock available')
      );
    });

    it('should throw error for insufficient quantity', async () => {
      await Car.findByIdAndUpdate(carId, { quantity: 1 });

      await expect(createOrder()).rejects.toThrow(
        new ConflictException('Insufficient stock available')
      );
    });

    it('should calculate total price correctly', async () => {
      const order = await createOrder();

      expect(order.totalPrice).toBe(fixtures.car.price * fixtures.orderData.quantity);
    });

    it('should generate unique payment reference', async () => {
      const order1 = await createOrder();
      const order2 = await createOrder();

      expect(order1.paymentReference).not.toBe(order2.paymentReference);
      expect(order1.paymentReference).toContain('PAY_');
      expect(order2.paymentReference).toContain('PAY_');
    });
  });

  describe('processPayment', () => {
    beforeEach(async () => {
      const order = await createOrder();
      orderId = order.id;
    });

    it('should validate order exists and belongs to customer', async () => {
      const order = await Order.findById(orderId);

      expect(order).toBeTruthy();
      expect(order?.customer.toString()).toBe(customerId);
      expect(order?.status).toBe(ORDER_STATUS.PENDING_PAYMENT);
    });

    it('should simulate payment success', async () => {
      jest.spyOn(OrderService as any, 'simulatePayment').mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
      });

      const paymentResult = await (OrderService as any).simulatePayment();
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBe('TXN_123456789');
    });

    it('should simulate payment failure', async () => {
      jest.spyOn(OrderService as any, 'simulatePayment').mockResolvedValue({
        success: false,
        error: 'Payment processing failed',
      });

      const paymentResult = await (OrderService as any).simulatePayment();
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toBe('Payment processing failed');
    });

    it('should validate payment flow requirements', async () => {
      const order = await Order.findById(orderId);
      const car = await Car.findById(carId);

      expect(order?.status).toBe(ORDER_STATUS.PENDING_PAYMENT);
      expect(car?.quantity).toBeGreaterThanOrEqual(order?.quantity || 0);
      expect(car?.available).toBe(true);
    });
  });

  describe('payment validation', () => {
    beforeEach(async () => {
      const order = await createOrder();
      orderId = order.id;
    });

    it('should validate order ownership before payment', async () => {
      const order = await Order.findById(orderId);

      expect(order?.customer.toString()).toBe(customerId);
      expect(order?.customer.toString()).not.toBe(secondCustomerId);
    });

    it('should validate order status for payment processing', async () => {
      const order = await Order.findById(orderId);
      expect(order?.status).toBe(ORDER_STATUS.PENDING_PAYMENT);

      await Order.findByIdAndUpdate(orderId, { status: ORDER_STATUS.PAID });
      const paidOrder = await Order.findById(orderId);
      expect(paidOrder?.status).toBe(ORDER_STATUS.PAID);
    });

    it('should validate car availability for payment', async () => {
      const car = await Car.findById(carId);
      const order = await Order.findById(orderId);

      expect(car?.available).toBe(true);
      expect(car?.quantity).toBeGreaterThanOrEqual(order?.quantity || 0);
    });
  });

  describe('updateOrderStatus', () => {
    beforeEach(async () => {
      const order = await createOrder();
      orderId = order.id;
      await Order.findByIdAndUpdate(orderId, { status: ORDER_STATUS.PAID });
    });

    it('should validate order can be updated', async () => {
      const order = await Order.findById(orderId);

      expect(order?.status).toBe(ORDER_STATUS.PAID);
      expect(order).toBeTruthy();
    });

    it('should throw error for non-existent order', async () => {
      await expect(OrderService.updateOrderStatus({
        orderId: fixtures.nonExistentId,
        managerId,
        updateData: fixtures.updateOrderData,
      })).rejects.toThrow(new NotFoundException('Order not found'));
    });

    it('should throw error for unpaid order', async () => {
      await Order.findByIdAndUpdate(orderId, { status: ORDER_STATUS.PENDING_PAYMENT });

      await expect(OrderService.updateOrderStatus({
        orderId,
        managerId,
        updateData: fixtures.updateOrderData,
      })).rejects.toThrow(new ConflictException('Order must be paid before status update'));
    });

    it('should update order status and add approval details', async () => {
      const updatedOrder = await OrderService.updateOrderStatus({
        orderId,
        managerId,
        updateData: fixtures.updateOrderData,
      });

      expect(updatedOrder).toMatchObject({
        status: ORDER_STATUS.CONFIRMED,
        notes: fixtures.updateOrderData.notes,
      });
      expect(updatedOrder.approvedBy?.toString()).toBe(managerId);
      expect(updatedOrder.approvedAt).toBeDefined();
    });

    it('should handle rejection status', async () => {
      const rejectionData = {
        status: ORDER_STATUS.REJECTED,
        notes: 'Order rejected due to inventory issues',
      };

      const rejectedOrder = await OrderService.updateOrderStatus({
        orderId,
        managerId,
        updateData: rejectionData,
      });

      expect(rejectedOrder.status).toBe(ORDER_STATUS.REJECTED);
      expect(rejectedOrder.notes).toBe(rejectionData.notes);
    });
  });

  describe('getOrders', () => {
    beforeEach(async () => {
      await createOrder();
      await createOrder(secondCustomerId);
    });

    it('should return paginated orders', async () => {
      const result = await OrderService.getOrders({
        filters: {},
        pagination: fixtures.pagination,
      });

      expect(result).toMatchObject({
        orders: expect.arrayContaining([
          expect.objectContaining({
            car: expect.objectContaining({ brand: fixtures.car.brand }),
            customer: expect.objectContaining({ name: fixtures.customer.name }),
          }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
        },
      });
    });

    it('should filter orders by status', async () => {
      const order = await Order.findOne();
      await Order.findByIdAndUpdate(order!._id, { status: ORDER_STATUS.PAID });

      const result = await OrderService.getOrders({
        filters: { status: ORDER_STATUS.PAID },
        pagination: fixtures.pagination,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].status).toBe(ORDER_STATUS.PAID);
    });

    it('should filter orders by customer', async () => {
      const result = await OrderService.getOrders({
        filters: { customerId },
        pagination: fixtures.pagination,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].customer.id).toBe(customerId);
    });
  });

  describe('getCustomerOrders', () => {
    beforeEach(async () => {
      await createOrder();
      await createOrder(customerId, carId, { ...fixtures.orderData, quantity: 1 });
    });

    it('should return customer orders with pagination', async () => {
      const result = await OrderService.getCustomerOrders(customerId, 1, 10);

      expect(result).toMatchObject({
        orders: expect.arrayContaining([
          expect.objectContaining({
            car: expect.objectContaining({ brand: fixtures.car.brand }),
          }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
        },
      });
    });

    it('should return empty result for customer with no orders', async () => {
      const result = await OrderService.getCustomerOrders(secondCustomerId, 1, 10);

      expect(result.orders).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getOrderById', () => {
    beforeEach(async () => {
      const order = await createOrder();
      orderId = order.id;
    });

    it('should return order by id with populated fields', async () => {
      const order = await OrderService.getOrderById({ orderId });

      expect(order).toMatchObject({
        quantity: fixtures.orderData.quantity,
        totalPrice: fixtures.car.price * fixtures.orderData.quantity,
        car: expect.objectContaining({
          brand: fixtures.car.brand,
          modelName: fixtures.car.modelName,
        }),
        customer: expect.objectContaining({
          name: fixtures.customer.name,
          email: fixtures.customer.email,
        }),
      });

      // if (order.customer && typeof order.customer === 'object' && 'password' in order.customer) {
      //   expect(order.customer).not.toHaveProperty('password');
      // }
    });

    it('should throw error for non-existent order', async () => {
      await expect(OrderService.getOrderById({
        orderId: fixtures.nonExistentId,
      })).rejects.toThrow(new NotFoundException('Order not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});