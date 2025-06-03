import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { ValidationException } from '../errors/common.errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }))

        console.log("errorMessages", errorMessages);
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          status: false,
          message: errorMessages.map((error) => error.message)
        });
      }
      next(error);
    }
  };
}; 
