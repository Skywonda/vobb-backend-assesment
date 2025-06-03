import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { APIToolkit } from "apitoolkit-express";
import axios from "axios";

import { connectDatabase } from "./shared/database/database";
import { logger } from "./shared/utils/logger.service";
import { carsRouter } from "./modules/cars";
import { managerRouter } from "./modules/managers/manager.routes";
import { customerRouter } from "./modules/customers/customers.routes";
import { ResponseHandler } from "./shared/utils/response.handler";
import config from './shared/config';
import { requestLogger } from './shared/middleware/request-logger.middleware';

const app = express();

app.use(helmet());
app.use(cors(config.server.cors));
app.use(rateLimit(config.api.rateLimiting));
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.logging.enabled) {
  app.use(requestLogger());
}

app.get("/health", (_req: Request, res: Response) => {
  ResponseHandler.success(res, {
    status: 'ok',
    message: "Server is up and running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const router = express.Router();

// Mount all route modules
router.use('/cars', carsRouter);
router.use('/managers', managerRouter);
router.use('/customers', customerRouter);

// Apply the router with the global prefix
app.use(config.api.prefix, router);

app.use((_req: Request, res: Response) => {
  ResponseHandler.error(
    res,
    new Error(`Route not found`),
    404
  );
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  ResponseHandler.error(res, err);
});

export const initialize = async (): Promise<void> => {
  await connectDatabase();
};

export const getApp = (): Application => {
  return app;
};
