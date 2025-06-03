import { Request, Response } from 'express';
import { CustomerService } from './customers.service';
import { ResponseHandler } from '../../shared/utils/response.handler';
import { AppError } from '../../shared/errors/common.errors';
import { AuthenticatedRequest } from '../../shared/types/express.types';



export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await CustomerService.login(req.body);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await CustomerService.register(req.body);
    ResponseHandler.created(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await CustomerService.getProfile(req.user.id);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await CustomerService.updateProfile(req.user.id, req.body);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};