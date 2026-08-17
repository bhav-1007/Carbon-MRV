import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/carbon_mrv",
  mongoConnectTimeoutMs: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  frontendOrigins: (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  llmApiKey: process.env.LLM_API_KEY || "",
  uploadDir: process.env.UPLOAD_DIR || "uploads"
};
