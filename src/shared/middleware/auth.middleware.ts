import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../errors/common.errors';
import { Manager } from '../../modules/managers/models/manager.model';
import { Customer } from '../../modules/customers/models/customers.model';
import config from '../config';
import { AuthenticatedRequest } from '../types/express.types';

interface TokenPayload {
  id: string;
  type: 'manager' | 'customer';
}

export const authenticateManager = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return next(new UnauthorizedException('No token provided'));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    if (decoded.type !== 'manager') {
      return next(new UnauthorizedException('Invalid token'));
    }

    const manager = await Manager.findById(decoded.id).select('-password');
    if (!manager) {
      return next(new UnauthorizedException('Unauthorized'));
    }

    (req as AuthenticatedRequest).user = {
      id: manager.id,
      type: 'manager',
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateCustomer = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return next(new UnauthorizedException('No token provided'));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    if (decoded.type !== 'customer') {
      return next(new UnauthorizedException('Invalid token'));
    }

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return next(new UnauthorizedException('Customer not found'));
    }

    (req as AuthenticatedRequest).user = {
      id: customer.id,
      type: 'customer',
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireManager = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.type !== 'manager') {
      return next(new ForbiddenException('Access denied'));
    }
    next();
  } catch (error) {
    next(error);
  }
};

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
} 