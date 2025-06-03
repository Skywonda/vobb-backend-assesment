import { Manager } from './models/manager.model';
import { LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto } from './types/manager.types';
import { ConflictException, NotFoundException, UnauthorizedException } from '../../shared/errors/common.errors';
import { PasswordUtil } from '../../shared/utils/password.util';
import { JWT_EXPIRY } from '../../shared/constant/auth.constant';
import jwt from 'jsonwebtoken';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class ManagerService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

  static async login(data: LoginDto) {
    const { email, password } = data;

    const manager = await Manager.findOne({ email });
    if (!manager) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.verify(manager.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateToken(manager.id);
    return { manager, tokens };
  }

  static async register(data: RegisterDto) {
    const { email, password, ...rest } = data;

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await PasswordUtil.hash(password);
    const manager = await Manager.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    const tokens = this.generateToken(manager.id);
    return { manager, tokens };
  }

  static async getProfile(managerId: string) {
    const manager = await Manager.findById(managerId);
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }
    return manager;
  }

  static async updateProfile(managerId: string, data: UpdateProfileDto) {
    const manager = await Manager.findByIdAndUpdate(
      managerId,
      { $set: data },
      { new: true }
    );

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    return manager;
  }

  static async changePassword(managerId: string, data: ChangePasswordDto) {
    const { currentPassword, newPassword } = data;

    const manager = await Manager.findById(managerId);
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    const isPasswordValid = await PasswordUtil.verify(manager.password, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);
    manager.password = hashedPassword;
    await manager.save();
  }

  private static generateToken(managerId: string): TokenPair {
    const accessToken = jwt.sign(
      { id: managerId, type: 'manager' },
      this.JWT_SECRET,
      { expiresIn: JWT_EXPIRY.ACCESS_TOKEN }
    );

    const refreshToken = jwt.sign(
      { id: managerId, type: 'manager' },
      this.JWT_SECRET,
      { expiresIn: JWT_EXPIRY.REFRESH_TOKEN }
    );

    return { accessToken, refreshToken };
  }
} 