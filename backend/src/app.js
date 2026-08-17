import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { paths } from "./config/paths.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { activityRoutes } from "./routes/activityRoutes.js";
import { emissionRoutes } from "./routes/emissionRoutes.js";
import { emissionFactorRoutes } from "./routes/emissionFactorRoutes.js";
import { miscRoutes } from "./routes/miscRoutes.js";
import { openApiSummary } from "./docs/openapi.js";

export const app = express();

app.set("etag", false);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (env.nodeEnv !== "production" && /^http:\/\/(localhost|127\.0\.0\.1|[\d.]+):\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/uploads", express.static(paths.uploadRoot));

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/v1/docs", (req, res) => res.json(openApiSummary));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/activity-logs", activityRoutes);
app.use("/api/v1/emissions", emissionRoutes);
app.use("/api/v1/emission-factors", emissionFactorRoutes);
app.use("/api/v1", miscRoutes);
app.use((req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } }));
app.use(errorHandler);
