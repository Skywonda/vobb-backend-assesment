import { Request, Response } from 'express';
import { ManagerService } from './manager.service';
import { ResponseHandler } from '../../shared/utils/response.handler';
import { AppError } from '../../shared/errors/common.errors';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ManagerService.login(req.body);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ManagerService.register(req.body);
    ResponseHandler.created(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ManagerService.getProfile(req?.user?.id);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ManagerService.updateProfile(req?.user?.id, req.body);
    ResponseHandler.success(res, result);
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    await ManagerService.changePassword(req?.user?.id, req.body);
    ResponseHandler.success(res, { message: 'Password changed successfully' });
  } catch (error) {
    ResponseHandler.error(res, error as AppError);
  }
}; 