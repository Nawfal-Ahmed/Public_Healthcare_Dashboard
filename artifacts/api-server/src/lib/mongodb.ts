import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  await mongoose.connect(uri, { dbName: "healthwatch" });
  logger.info("Connected to MongoDB");
}
