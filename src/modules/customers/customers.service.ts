import { Customer, ICustomer } from './models/customers.model';
import { CreateCustomerDto, UpdateCustomerDto, LoginDto, RegisterDto, UpdateProfileDto } from './types/customer.type';
import { ConflictException, NotFoundException, UnauthorizedException } from '../../shared/errors/common.errors';
import { PasswordUtil } from '../../shared/utils/password.util';
import { JWT_EXPIRY } from '../../shared/constant/auth.constant';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class CustomerService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

  static async register(data: RegisterDto) {
    const { email, password, ...rest } = data;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await PasswordUtil.hash(password);
    const customer = await Customer.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    const tokens = this.generateToken(customer.id);
    return { customer, tokens };
  }

  static async login(data: LoginDto) {
    const { email, password } = data;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.verify(customer.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateToken(customer.id);
    return { customer, tokens };
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find().skip(skip).limit(limit),
      Customer.countDocuments(),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string): Promise<ICustomer> {
    const customer = await Customer.findById(id).populate('purchases.car');
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  static async update(id: string, data: UpdateCustomerDto): Promise<ICustomer> {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  static async getProfile(customerId: string) {
    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  static async updateProfile(customerId: string, data: UpdateProfileDto) {
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: data },
      { new: true }
    ).select('-password');

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  private static generateToken(customerId: string): TokenPair {
    const accessToken = jwt.sign(
      { id: customerId, type: 'customer' },
      this.JWT_SECRET,
      { expiresIn: JWT_EXPIRY.ACCESS_TOKEN }
    );

    const refreshToken = jwt.sign(
      { id: customerId, type: 'customer' },
      this.JWT_SECRET,
      { expiresIn: JWT_EXPIRY.REFRESH_TOKEN }
    );

    return { accessToken, refreshToken };
  }
}