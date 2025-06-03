import mongoose from 'mongoose';
import config from './shared/config/index';
import { logger } from './shared/utils/logger.service';
import { validateEnv } from './shared/config/env.validation';
import { getApp, initialize } from './app';

validateEnv();

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.db.url);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();
    await initialize();

    const app = getApp();
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
