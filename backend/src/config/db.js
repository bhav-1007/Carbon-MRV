import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri, {
    connectTimeoutMS: env.mongoConnectTimeoutMs,
    serverSelectionTimeoutMS: env.mongoConnectTimeoutMs
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
