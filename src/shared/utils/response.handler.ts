import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from './logger.service';

interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    [key: string]: any;
  };
}

interface ResponseOptions {
  excludeFields?: string[];
  metadata?: Record<string, any>;
}

export class ResponseHandler {
  private static filterData<T>(data: T, excludeFields?: string[]): T {
    if (!data || !excludeFields?.length) return data;

    if (Array.isArray(data)) {
      return data.map(item =>
        typeof item === 'object' ? this.filterObject(item, excludeFields) : item
      ) as T;
    }

    if (typeof data === 'object') {
      return this.filterObject(data, excludeFields);
    }

    return data;
  }

  private static filterObject<T extends object>(obj: T, excludeFields: string[]): T {
    const filteredData = { ...obj };
    excludeFields.forEach(field => {
      delete (filteredData as any)[field];
    });
    return filteredData;
  }

  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    options?: ResponseOptions
  ): void {
    const response: ApiResponse<T> = {
      status: true,
      message,
    };

    if (data !== undefined) {
      response.data = this.filterData(data, options?.excludeFields);
    }

    if (options?.metadata) {
      response.metadata = options.metadata;
    }

    res.status(StatusCodes.OK).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message?: string,
    options?: ResponseOptions
  ): void {
    const response: ApiResponse<T> = {
      status: true,
      data: this.filterData(data, options?.excludeFields),
      message: message || 'Resource created successfully',
    };

    if (options?.metadata) {
      response.metadata = options.metadata;
    }

    res.status(StatusCodes.CREATED).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    options?: ResponseOptions
  ): void {
    const response: ApiResponse<T[]> = {
      status: true,
      data,
      metadata: {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        ...(options?.metadata || {})
      }
    };

    res.status(StatusCodes.OK).json(response);
  }

  static error(
    res: Response,
    error: Error,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
  ): void {
    const response: ApiResponse = {
      status: false,
      message: error.message || 'Internal server error',
    };

    // Check if error is an AppError and use its status code
    const finalStatusCode = 'statusCode' in error ? (error as any).statusCode : statusCode;

    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message, error.stack);
      // response.metadata = {
      //   stack: error.stack
      // };
    }

    res.status(finalStatusCode).json(response);
  }
} 