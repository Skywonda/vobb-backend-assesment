import mongoose from "mongoose";
import { logger } from "../utils/logger.service";

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/car-dealership";

    await mongoose.connect(uri);

    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("Database disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error("Database error:", error);
});
